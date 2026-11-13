#!/usr/bin/env node
/**
 * Downloads ONNX weights into ENGINE_MODEL_DIR (default ./models).
 *
 * URLs come from env vars so you control where weights are hosted:
 *   MODEL_URL_BIREFNET, MODEL_URL_MODNET, MODEL_URL_VITMATTE
 * Optional integrity check:
 *   MODEL_SHA256_BIREFNET, MODEL_SHA256_MODNET, MODEL_SHA256_VITMATTE
 * Optional auth (private Hugging Face repo / bearer-protected bucket):
 *   MODEL_AUTH_TOKEN  (or HF_TOKEN)
 *
 * Usage:
 *   npm run fetch-models            # download missing files
 *   npm run fetch-models -- --sums  # print sha256 of local files (to fill the env vars)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { MODELS, AUX_MODELS } from "../src/lib/engine/models.mjs";

const DIR = process.env.ENGINE_MODEL_DIR || path.join(process.cwd(), "models");
const ALL = { ...MODELS, ...AUX_MODELS };
const TOKEN = process.env.MODEL_AUTH_TOKEN || process.env.HF_TOKEN;
const OPTIONAL = new Set((process.env.MODEL_OPTIONAL || "modnet").split(",").map((s) => s.trim()));
/**
 * Public Hugging Face sources. SHA-256 verified identical to the weights used
 * for benchmarks (Oct 2026). Override via MODEL_URL_* / MODEL_SHA256_* if needed.
 */
const HF = "https://huggingface.co";
const DEFAULTS = {
  birefnet: {
    url: `${HF}/onnx-community/BiRefNet_lite-ONNX/resolve/de15b22ba131738a16dff04aab8bdf8dc32e3ac1/onnx/model.onnx`,
    sha256: "5600024376f572a557870a5eb0afb1e5961636bef4e1e22132025467d0f03333",
  },
  modnet: {
    url: `${HF}/Xenova/modnet/resolve/fa2fa546052fba4c08921230a26cc69a333fca12/onnx/model.onnx`,
    sha256: "07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9",
  },
  vitmatte: {
    url: `${HF}/Xenova/vitmatte-small-composition-1k/resolve/6bc1297f6140f055a227b6d2cfe8c093281f35d2/onnx/model.onnx`,
    sha256: "bf28d2e0be2c073286e88d60ad649d7123da2749a2d99133fd1098d5887e0225",
  },
};

function sha256(file) {
  return new Promise((res, rej) => {
    const h = crypto.createHash("sha256");
    fs.createReadStream(file).on("data", (d) => h.update(d)).on("end", () => res(h.digest("hex"))).on("error", rej);
  });
}

async function printSums() {
  for (const m of Object.values(ALL)) {
    const f = path.join(DIR, m.file);
    if (fs.existsSync(f)) console.log(`MODEL_SHA256_${m.id.toUpperCase()}=${await sha256(f)}`);
    else console.log(`# ${m.id}: missing (${f})`);
  }
}

async function fetchOne(m) {
  const key = m.id.toUpperCase();
  const url = process.env[`MODEL_URL_${key}`] || DEFAULTS[m.id]?.url;
  const want = (process.env[`MODEL_SHA256_${key}`] || DEFAULTS[m.id]?.sha256)?.toLowerCase();
  const dest = path.join(DIR, m.file);

  if (fs.existsSync(dest)) {
    if (!want || (await sha256(dest)) === want) return console.log(`[models] ${m.id}: present`);
    console.warn(`[models] ${m.id}: checksum mismatch, re-downloading`);
  }
  if (!url) {
    const msg = `[models] ${m.id}: MODEL_URL_${key} not set`;
    if (OPTIONAL.has(m.id)) return console.warn(`${msg} (optional, skipped)`);
    throw new Error(msg);
  }

  console.log(`[models] ${m.id}: downloading ${url}`);
  const res = await fetch(url, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}, redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`[models] ${m.id}: HTTP ${res.status}`);
  const tmp = `${dest}.part`;
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tmp));
  if (want) {
    const got = await sha256(tmp);
    if (got !== want) { fs.rmSync(tmp); throw new Error(`[models] ${m.id}: sha256 ${got} != ${want}`); }
  }
  fs.renameSync(tmp, dest);
  console.log(`[models] ${m.id}: ok (${(fs.statSync(dest).size / 1e6).toFixed(1)} MB)`);
}

fs.mkdirSync(DIR, { recursive: true });
if (process.argv.includes("--sums")) {
  await printSums();
} else {
  for (const m of Object.values(ALL)) await fetchOne(m);
}

