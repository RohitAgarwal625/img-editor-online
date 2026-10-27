import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  sigmoid, boxFilter, resizeBilinear, cleanupComponents, estimateForegroundRGBA, assessAlpha, uncertaintyBand,
} from "../src/lib/engine/alpha-core.mjs";
import { ingest, toTensorData, outputToAlpha, modelInputSize } from "../src/lib/engine/pipeline.mjs";
import { MODELS } from "../src/lib/engine/models.mjs";

test("sigmoid is stable for large logits", () => {
  assert.equal(sigmoid(-1000), 0);
  assert.equal(sigmoid(1000), 1);
  assert.ok(Math.abs(sigmoid(0) - 0.5) < 1e-12);
});

test("boxFilter preserves constants incl. borders", () => {
  const a = new Float32Array(25).fill(0.7);
  for (const v of boxFilter(a, 5, 5, 2)) assert.ok(Math.abs(v - 0.7) < 1e-6);
});

test("resizeBilinear keeps constant and dimensions", () => {
  const r = resizeBilinear(new Float32Array(16).fill(1), 4, 4, 9, 7);
  assert.equal(r.length, 63);
  assert.ok(r.every((v) => Math.abs(v - 1) < 1e-6));
});

test("normalisation produces planar NCHW with ImageNet stats", () => {
  const t = toTensorData(Uint8Array.from([255, 0, 128]), 1, MODELS.birefnet.normalize);
  assert.ok(Math.abs(t[0] - (1 - 0.485) / 0.229) < 1e-5);
  assert.ok(Math.abs(t[1] - (0 - 0.456) / 0.224) < 1e-5);
});

test("BiRefNet logits go through sigmoid; MODNet output is clamped", () => {
  assert.ok(outputToAlpha(Float32Array.from([-30, 30]), MODELS.birefnet)[0] < 1e-6);
  assert.deepEqual([...outputToAlpha(Float32Array.from([-0.2, 1.3, 0.5]), MODELS.modnet)], [0, 1, 0.5]);
});

test("MODNet input size is a multiple of 32", () => {
  const { mw, mh } = modelInputSize(MODELS.modnet, 1000, 3000);
  assert.equal(mw % 32, 0); assert.equal(mh % 32, 0); assert.equal(mw, 512);
});

test("cleanup removes specks, fills pin-holes, preserves real holes", () => {
  const w = 300, h = 300, a = new Float32Array(w * h);
  for (let y = 10; y < 290; y++) for (let x = 10; x < 290; x++) a[y * w + x] = 1;
  for (let y = 40; y < 60; y++) for (let x = 40; x < 60; x++) a[y * w + x] = 0;
  a[50 * w + 20] = 0;
  a[2 * w + 2] = 1;
  const r = cleanupComponents(a, w, h);
  assert.equal(r.alpha[2 * w + 2], 0);
  assert.equal(r.alpha[50 * w + 20], 1);
  assert.equal(r.alpha[50 * w + 50], 0);
});

test("foreground estimation keeps opaque RGB and reduces colour spill", () => {
  const W = 64, H = 64, rgb = new Uint8Array(W * H * 3), alpha = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const x = i % W, a = x < 30 ? 1 : x < 34 ? (34 - x) / 4 : 0;
    alpha[i] = a;
    rgb[i * 3] = Math.round(200 * a); rgb[i * 3 + 1] = Math.round(200 * (1 - a));
  }
  const out = estimateForegroundRGBA(rgb, alpha, W, H);
  assert.equal(out[0], rgb[0]); assert.equal(out[3], 255);
  const i = 32 * W + 32;
  assert.ok(out[i * 4 + 1] < rgb[i * 3 + 1], "green spill reduced");
  assert.equal(out[(32 * W + 60) * 4 + 3], 0);
});

test("uncertainty band covers edges only", () => {
  const w = 20, h = 20, a = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = i % w < 10 ? 1 : 0;
  const b = uncertaintyBand(a, w, h, 1);
  assert.equal(b[5 * w], 0); assert.equal(b[5 * w + 10], 1);
});

test("assessAlpha reports holes and bbox", () => {
  const w = 50, h = 50, a = new Float32Array(w * h);
  for (let y = 10; y < 40; y++) for (let x = 10; x < 40; x++) a[y * w + x] = 1;
  for (let y = 20; y < 30; y++) for (let x = 20; x < 30; x++) a[y * w + x] = 0;
  const q = assessAlpha(a, w, h);
  assert.equal(q.enclosedHoles, 1);
  assert.deepEqual(q.bbox, { x: 10, y: 10, w: 30, h: 30 });
});

test("ingest applies EXIF orientation and rejects garbage", async () => {
  const jpg = await sharp({ create: { width: 40, height: 20, channels: 3, background: "#f00" } })
    .jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const r = await ingest(jpg);
  assert.equal(r.width, 20); assert.equal(r.height, 40);
  assert.equal(r.rgb.length, 20 * 40 * 3);
  await assert.rejects(ingest(Buffer.from("not an image")), (e) => e.status === 415);
});
