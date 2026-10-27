/**
 * Production background-removal pipeline (server side, Node + onnxruntime + sharp).
 *
 * Stages (see docs/ENGINE.md):
 *  A ingest      decode once, EXIF-rotate, keep full-res RGB in memory
 *  B/C segment   one primary model (BiRefNet), continuous sigmoid alpha
 *  D refine      connected-component cleanup + colour guided filter restricted
 *                to the uncertain band (no global blur / erosion / dilation)
 *  G hi-res      fast guided upsampling to original size; conditional crop
 *                re-inference for small subjects, feather-blended (no seams)
 *  F foreground  blur-fusion colour decontamination of semi-transparent pixels
 *  H QA          cheap mask statistics; flags reported, recovery only if warranted
 */
import fs from "node:fs";
import os from "node:os";
import sharp from "sharp";
import { MODELS, AUX_MODELS, modelPath, PIPELINE_CONFIG as CFG } from "./models.mjs";
import { estimateForegroundTiled } from "./foreground.mjs";
import { conditionalMatting } from "./matting.mjs";
import {
  sigmoid, boxFilter, resizeBilinear, fastColorGuidedFilter, uncertaintyBand,
  cleanupComponents, estimateForegroundRGBA, assessAlpha,
} from "./alpha-core.mjs";

sharp.concurrency(Math.max(1, os.cpus().length - 1));

/* ------------------------------------------------------------------ */
/* Session management: warm, cached, serialised                        */
/* ------------------------------------------------------------------ */
const sessions = new Map();
let ortMod = null;
async function ort() {
  if (ortMod) return ortMod;
  const m = await import("onnxruntime-node");
  ortMod = m.InferenceSession ? m : m.default;
  return ortMod;
}

function providerList() {
  const env = process.env.ENGINE_EP; // e.g. "cuda,cpu" | "coreml,cpu" | "cpu"
  if (env) return env.split(",").map((s) => s.trim()).filter(Boolean);
  return ["cpu"];
}

export async function getSession(id) {
  if (sessions.has(id)) return sessions.get(id);
  const p = (async () => {
    const file = modelPath(id);
    if (!fs.existsSync(file)) throw new EngineError("MODEL_MISSING", `Model weights not found: ${file}`);
    const o = await ort();
    const opts = { graphOptimizationLevel: "all", intraOpNumThreads: os.cpus().length };
    const eps = providerList();
    try {
      const s = await o.InferenceSession.create(file, { ...opts, executionProviders: eps });
      return { session: s, providers: eps };
    } catch (err) {
      if (eps.length === 1 && eps[0] === "cpu") throw err;
      console.warn(`[engine] EP ${eps} failed (${err?.message}); falling back to CPU`);
      const s = await o.InferenceSession.create(file, { ...opts, executionProviders: ["cpu"] });
      return { session: s, providers: ["cpu"] };
    }
  })();
  sessions.set(id, p);
  p.catch(() => sessions.delete(id));
  return p;
}

/** One inference at a time per process: ORT already saturates all cores/GPU. */
let queue = Promise.resolve();
function serialise(fn) {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

export class EngineError extends Error {
  constructor(code, message, status = 500) { super(message); this.code = code; this.status = status; }
}

/* ------------------------------------------------------------------ */
/* Stage A: ingestion                                                  */
/* ------------------------------------------------------------------ */
export async function ingest(input) {
  let img;
  try {
    img = sharp(input, { limitInputPixels: CFG.maxInputPixels, failOn: "error" }).rotate();
  } catch (e) {
    throw new EngineError("BAD_IMAGE", `Unsupported image: ${e.message}`, 415);
  }
  let meta;
  try { meta = await sharp(input).metadata(); } catch (e) {
    throw new EngineError("BAD_IMAGE", `Unsupported or corrupt image: ${e.message}`, 415);
  }
  const { data, info } = await img.removeAlpha().toColourspace("srgb").raw()
    .toBuffer({ resolveWithObject: true })
    .catch((e) => { throw new EngineError("BAD_IMAGE", e.message, /pixel limit/i.test(e.message) ? 413 : 415); });
  if (info.width < CFG.minSide || info.height < CFG.minSide)
    throw new EngineError("TOO_SMALL", `Image must be at least ${CFG.minSide}px per side`, 422);
  return {
    rgb: data, width: info.width, height: info.height,
    meta: { format: meta.format, orientation: meta.orientation ?? 1, hasAlpha: !!meta.hasAlpha, space: meta.space },
  };
}

/* ------------------------------------------------------------------ */
/* Stage C: model I/O                                                  */
/* ------------------------------------------------------------------ */
export function modelInputSize(spec, w, h) {
  if (spec.size.mode === "fixed") return { mw: spec.size.width, mh: spec.size.height };
  const { ref, multiple } = spec.size;
  const s = ref / Math.min(w, h);
  const r = (v) => Math.max(multiple, Math.round((v * s) / multiple) * multiple);
  return { mw: r(w), mh: r(h) };
}

/** Raw interleaved RGB -> normalised NCHW float32. */
export function toTensorData(rgb, n, { mean, std }) {
  const f = new Float32Array(3 * n);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < 3; c++) f[c * n + i] = (rgb[i * 3 + c] / 255 - mean[c]) / std[c];
  return f;
}

export function outputToAlpha(data, spec) {
  const a = new Float32Array(data.length);
  if (spec.activation === "sigmoid") for (let i = 0; i < a.length; i++) a[i] = sigmoid(data[i]);
  else for (let i = 0; i < a.length; i++) a[i] = data[i] < 0 ? 0 : data[i] > 1 ? 1 : data[i];
  return a;
}

/** Resize raw RGB with libvips (no re-encode). */
async function resizeRaw(rgb, w, h, dw, dh, region) {
  let s = sharp(rgb, { raw: { width: w, height: h, channels: 3 } });
  if (region) s = s.extract(region);
  return s.resize(dw, dh, { fit: "fill", kernel: "lanczos3" }).raw().toBuffer();
}

async function predict(id, rgb, w, h, region) {
  const spec = MODELS[id];
  const sw = region ? region.width : w, sh = region ? region.height : h;
  const { mw, mh } = modelInputSize(spec, sw, sh);
  const small = await resizeRaw(rgb, w, h, mw, mh, region);
  const { session } = await getSession(id);
  const o = await ort();
  const tensor = new o.Tensor("float32", toTensorData(small, mw * mh, spec.normalize), [1, 3, mh, mw]);
  const t = Date.now();
  let out;
  try {
    out = await serialise(() => session.run({ [spec.input]: tensor }));
  } catch (e) {
    const oom = /memory|alloc|CUDA/i.test(String(e?.message));
    throw new EngineError(oom ? "INFERENCE_OOM" : "INFERENCE_FAILED", `Inference failed: ${e?.message}`, oom ? 503 : 500);
  }
  return { alpha: outputToAlpha(out[spec.output].data, spec), small, mw, mh, inferMs: Date.now() - t };
}

/* ------------------------------------------------------------------ */
/* Stage D + G: refine at model res, guided upsample to full res        */
/* ------------------------------------------------------------------ */
function refineToFull(pred, fullRgb, W, H, timings) {
  const { alpha, small, mw, mh } = pred;
  let t = Date.now();
  const cleaned = cleanupComponents(alpha, mw, mh, CFG.cleanup);
  timings.cleanupMs = (timings.cleanupMs ?? 0) + Date.now() - t;

  t = Date.now();
  const { radius, eps, bandRadius } = CFG.guided;
  const guided = fastColorGuidedFilter(small, cleaned.alpha, mw, mh, fullRgb, W, H, radius, eps);
  const plain = resizeBilinear(cleaned.alpha, mw, mh, W, H);
  // Soft band weight so the guided result is used only around uncertain
  // boundaries; confident interior/exterior come from the model directly.
  const band = uncertaintyBand(cleaned.alpha, mw, mh, bandRadius);
  const bf = new Float32Array(mw * mh);
  for (let i = 0; i < bf.length; i++) bf[i] = band[i];
  const wBand = resizeBilinear(boxFilter(bf, mw, mh, 1), mw, mh, W, H);
  const out = new Float32Array(W * H);
  for (let i = 0; i < out.length; i++) {
    const w = wBand[i];
    let v = w * guided[i] + (1 - w) * plain[i];
    // Snap near-certain values: removes faint grey veils/halos without
    // touching genuine soft hair (0.02..0.98 is left untouched).
    if (v < 0.02) v = 0; else if (v > 0.98) v = 1;
    out[i] = v;
  }
  timings.refineMs = (timings.refineMs ?? 0) + Date.now() - t;
  return { alpha: out, cleanup: cleaned };
}

/* ------------------------------------------------------------------ */
/* Public entry                                                         */
/* ------------------------------------------------------------------ */
/**
 * @param {Buffer} input encoded image
 * @param {{ preview?: boolean, maxPreviewSide?: number, decontaminate?: boolean, cropRefine?: boolean|'auto' }} [opts]
 */
export async function removeBackground(input, opts = {}) {
  const T0 = Date.now();
  const timings = {};
  const modelId = opts.model ?? CFG.primaryModel;
  if (!MODELS[modelId]) throw new EngineError("BAD_MODEL", `Unknown model: ${modelId}`, 400);
  const log = { model: modelId, decisions: [] };

  let t = Date.now();
  const img = await ingest(input);
  let { rgb, width: W, height: H } = img;
  if (opts.preview) {
    const m = opts.maxPreviewSide ?? 1024;
    const s = Math.min(1, m / Math.max(W, H));
    if (s < 1) {
      const nw = Math.round(W * s), nh = Math.round(H * s);
      rgb = await resizeRaw(rgb, W, H, nw, nh); W = nw; H = nh;
    }
  }
  timings.preprocessMs = Date.now() - t;

  // Stage C: primary segmentation.
  const pred = await predict(modelId, rgb, W, H);
  timings.inferenceMs = pred.inferMs;
  log.providers = (await getSession(modelId)).providers;

  if (opts.naive) {
    // Reproduces the legacy routes: plain upsampled alpha on raw RGB.
    t = Date.now();
    const alpha = resizeBilinear(pred.alpha, pred.mw, pred.mh, W, H);
    const rgba = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2];
      rgba[i * 4 + 3] = Math.round(alpha[i] * 255);
    }
    timings.reconstructMs = Date.now() - t;
    t = Date.now();
    const png = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: CFG.png.compressionLevel }).toBuffer();
    timings.encodeMs = Date.now() - t;
    timings.totalMs = Date.now() - T0;
    const q = assessAlpha(pred.alpha, pred.mw, pred.mh);
    return { png, width: W, height: H, timings, qa: { ...q, flags: [] }, log, source: img.meta, alpha };
  }

  let { alpha, cleanup } = refineToFull(pred, rgb, W, H, timings);
  log.cleanup = { removedIslands: cleanup.removedIslands, filledPinholePixels: cleanup.filledPinholePixels };

  // Stage H (pre-recovery QA) on model-resolution alpha (cheap).
  let qa = assessAlpha(cleanup.alpha, pred.mw, pred.mh);

  // Stage G: conditional high-resolution crop refinement.
  const cr = CFG.cropRefine;
  const want = opts.cropRefine ?? "auto";
  if (want && qa.bbox && qa.fgRatio > CFG.qa.emptyFg) {
    const sx = W / pred.mw, sy = H / pred.mh;
    const bx = qa.bbox.x * sx, by = qa.bbox.y * sy, bw = qa.bbox.w * sx, bh = qa.bbox.h * sy;
    const mx = Math.max(bw, bh) * cr.margin;
    const x0 = Math.max(0, Math.floor(bx - mx)), y0 = Math.max(0, Math.floor(by - mx));
    const x1 = Math.min(W, Math.ceil(bx + bw + mx)), y1 = Math.min(H, Math.ceil(by + bh + mx));
    const region = { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
    // Effective resolution gain of re-running the model on the crop.
    const gain = Math.min(pred.mw / Math.min(pred.mw, region.width), pred.mh / Math.min(pred.mh, region.height))
      * Math.min(1, Math.min(region.width, region.height) / Math.min(pred.mw, pred.mh)) || 1;
    const linearGain = Math.min(W / region.width, H / region.height);
    const big = Math.max(W, H) > Math.max(pred.mw, pred.mh) * 1.25;
    const trigger = want === true || (qa.bboxAreaRatio < cr.maxBboxAreaRatio && linearGain >= cr.minGain && big);
    log.decisions.push({ stage: "crop-refine", bboxAreaRatio: +qa.bboxAreaRatio.toFixed(3), linearGain: +linearGain.toFixed(2), triggered: !!trigger });
    if (trigger && region.width >= 32 && region.height >= 32) {
      const cropRgb = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).extract(region).raw().toBuffer();
      const p2 = await predict(modelId, rgb, W, H, region);
      timings.inferenceMs += p2.inferMs;
      const r2 = refineToFull(p2, cropRgb, region.width, region.height, timings);
      t = Date.now();
      // Feathered paste: weight ramps to 0 near crop edges that are interior to the image.
      const feather = Math.max(8, Math.round(Math.min(region.width, region.height) * 0.04));
      for (let y = 0; y < region.height; y++) {
        const dy = Math.min(y0 === 0 ? Infinity : y, y1 === H ? Infinity : region.height - 1 - y);
        for (let x = 0; x < region.width; x++) {
          const dx = Math.min(x0 === 0 ? Infinity : x, x1 === W ? Infinity : region.width - 1 - x);
          const w = Math.min(1, Math.min(dx, dy) / feather);
          const gi = (y + y0) * W + (x + x0);
          alpha[gi] = w * r2.alpha[y * region.width + x] + (1 - w) * alpha[gi];
        }
      }
      // Outside the crop the subject is absent by construction; suppress leakage.
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
        const i = y * W + x; if (alpha[i] < 0.5) alpha[i] = 0;
      }
      timings.reconstructMs = (timings.reconstructMs ?? 0) + Date.now() - t;
    }
  }

  // Stage E: conditional trimap-guided matting (ViTMatte) on the boundary only.
  const mc = CFG.matting;
  const wantMat = opts.matting ?? (process.env.ENGINE_MATTING === "auto" ? "auto" : false); // opt-in until validated against GT
  const qaSoft = assessAlpha(resizeBilinear(alpha, W, H, pred.mw, pred.mh), pred.mw, pred.mh).softRatio;
  const trigMat = wantMat === true || (wantMat === "auto" && qaSoft >= mc.triggerSoftRatio);
  log.decisions.push({ stage: "matting", softRatio: +qaSoft.toFixed(4), triggered: !!trigMat });
  if (trigMat && fs.existsSync(modelPath(mc.model))) {
    t = Date.now();
    const { session } = await getSession(mc.model);
    const o = await ort();
    const spec = AUX_MODELS[mc.model];
    try {
      const r = await conditionalMatting({
        rgb, alpha, W, H, cfg: mc,
        resizeRegion: (region, w, h) => resizeRaw(rgb, W, H, w, h, region),
        infer: async (data, h, w) => {
          const out = await serialise(() => session.run({ [spec.input]: new o.Tensor("float32", data, [1, 4, h, w]) }));
          return out[spec.output].data;
        },
      });
      if (r) {
        alpha = r.alpha;
        timings.mattingInferMs = r.inferMs;
        log.matting = { region: r.region, work: r.work, unknownRatio: +r.unknownRatio.toFixed(3) };
      }
    } catch (e) {
      // Matting is a quality-recovery stage: never fail the request because of it.
      log.matting = { error: String(e?.message ?? e) };
    }
    timings.mattingMs = Date.now() - t;
  }

  // Stage F: foreground colour estimation (tiled: only tiles with soft pixels).
  t = Date.now();
  let rgba;
  if (opts.decontaminate === false) {
    rgba = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2];
      rgba[i * 4 + 3] = Math.round(alpha[i] * 255);
    }
  } else {
    const fg = estimateForegroundTiled(rgb, alpha, W, H);
    rgba = fg.rgba;
    log.foreground = { softTiles: fg.softTiles, totalTiles: fg.totalTiles };
  }
  timings.foregroundMs = Date.now() - t;

  // Stage H: final QA flags (reported; no fabricated confidence).
  qa = assessAlpha(resizeBilinear(alpha, W, H, pred.mw, pred.mh), pred.mw, pred.mh);
  const flags = [];
  if (qa.fgRatio < CFG.qa.emptyFg) flags.push("no-subject-detected");
  if (qa.fgRatio > CFG.qa.fullFg) flags.push("subject-fills-frame");
  if (qa.borderFgRatio > 0.5) flags.push("subject-touches-border");

  t = Date.now();
  const png = await sharp(Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength), { raw: { width: W, height: H, channels: 4 } })
    .png({ compressionLevel: CFG.png.compressionLevel, adaptiveFiltering: false })
    .toBuffer();
  timings.encodeMs = Date.now() - t;
  timings.totalMs = Date.now() - T0;

  return { png, width: W, height: H, timings, qa: { ...qa, flags }, log, source: img.meta, alpha };
}

/** Warm the primary model so the first request does not pay init cost. */
export function warmup(opts = {}) {
  const ids = opts.models ?? [CFG.primaryModel];
  return Promise.all(ids.map(getSession));
}
