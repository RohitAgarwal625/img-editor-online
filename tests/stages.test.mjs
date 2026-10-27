import test from "node:test";
import assert from "node:assert/strict";
import { estimateForegroundRGBA } from "../src/lib/engine/alpha-core.mjs";
import { estimateForegroundTiled } from "../src/lib/engine/foreground.mjs";
import { conditionalMatting } from "../src/lib/engine/matting.mjs";

function scene(W, H) {
  const rgb = new Uint8Array(W * H * 3), alpha = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, d = Math.hypot(x - W / 2, y - H / 2) - W / 4;
    const a = d < -3 ? 1 : d > 3 ? 0 : (3 - d) / 6;
    alpha[i] = a;
    rgb[i * 3] = Math.round(220 * a + 10 * (1 - a));
    rgb[i * 3 + 1] = Math.round(30 * a + 200 * (1 - a));
    rgb[i * 3 + 2] = 40;
  }
  return { rgb, alpha };
}

test("tiled foreground: opaque pixels exact, background pixels untouched", () => {
  const W = 600, H = 600, { rgb, alpha } = scene(W, H);
  const { rgba, softTiles, totalTiles } = estimateForegroundTiled(rgb, alpha, W, H);
  assert.ok(softTiles <= totalTiles);
  const c = (H / 2) * W + W / 2;
  assert.deepEqual([...rgba.subarray(c * 4, c * 4 + 4)], [rgb[c * 3], rgb[c * 3 + 1], rgb[c * 3 + 2], 255]);
  assert.equal(rgba[3], 0);
});

test("tiled foreground matches the full-frame reference in the soft band", () => {
  const W = 400, H = 400, { rgb, alpha } = scene(W, H);
  const ref = estimateForegroundRGBA(rgb, alpha, W, H);
  const { rgba } = estimateForegroundTiled(rgb, alpha, W, H);
  let maxDiff = 0, n = 0, spillRef = 0, spillTiled = 0;
  for (let i = 0; i < W * H; i++) {
    if (alpha[i] <= 0.05 || alpha[i] >= 0.95) continue;
    n++;
    for (let c = 0; c < 3; c++) maxDiff = Math.max(maxDiff, Math.abs(ref[i * 4 + c] - rgba[i * 4 + c]));
    spillRef += ref[i * 4 + 1]; spillTiled += rgba[i * 4 + 1];
  }
  assert.ok(n > 0);
  assert.ok(maxDiff <= 12, `max channel diff ${maxDiff}`);
  // Green spill must be reduced vs the raw composite.
  let raw = 0; for (let i = 0; i < W * H; i++) if (alpha[i] > 0.05 && alpha[i] < 0.95) raw += rgb[i * 3 + 1];
  assert.ok(spillTiled < raw);
});

test("conditional matting only changes pixels inside the unknown band", async () => {
  const W = 256, H = 256, { rgb, alpha } = scene(W, H);
  const r = await conditionalMatting({
    rgb, alpha, W, H,
    cfg: { maxSide: 256, lo: 0.05, hi: 0.95, bandFrac: 0.01, padFrac: 0.02 },
    resizeRegion: async (reg, w, h) => {
      const out = new Uint8Array(w * h * 3);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const sx = reg.left + Math.floor((x * reg.width) / w), sy = reg.top + Math.floor((y * reg.height) / h);
        out.set(rgb.subarray((sy * W + sx) * 3, (sy * W + sx) * 3 + 3), (y * w + x) * 3);
      }
      return out;
    },
    infer: async (data, h, w) => new Float32Array(h * w).fill(0.5), // fake model
  });
  assert.ok(r);
  const c = (H / 2) * W + W / 2;
  assert.equal(r.alpha[c], 1, "interior unchanged");
  assert.equal(r.alpha[0], 0, "far background unchanged");
});

test("conditional matting skips binary masks", async () => {
  const a = new Float32Array(64 * 64).fill(1);
  const r = await conditionalMatting({ rgb: new Uint8Array(64 * 64 * 3), alpha: a, W: 64, H: 64, cfg: { maxSide: 64, lo: 0.05, hi: 0.95, bandFrac: 0.01, padFrac: 0 }, resizeRegion: null, infer: null });
  assert.equal(r, null);
});
