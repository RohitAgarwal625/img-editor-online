/**
 * Stage E: conditional trimap-guided matting with ViTMatte.
 *
 * Only the boundary region is processed: a trimap is derived from the primary
 * alpha (fg >= hi, bg <= lo, everything else + a dilation band = unknown),
 * ViTMatte predicts alpha for the unknown band, and the result is blended back
 * ONLY inside that band. Confident interior/exterior pixels are never changed.
 */
import { boxFilter, resizeBilinear, fastColorGuidedFilter } from "./alpha-core.mjs";

const round32 = (v) => Math.max(32, Math.round(v / 32) * 32);

export async function conditionalMatting({ rgb, alpha, W, H, resizeRegion, infer, cfg }) {
  const { maxSide, lo, hi, bandFrac, padFrac } = cfg;
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = alpha[y * W + x];
    if (a > lo && a < hi) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  if (maxX < 0) return null;
  const pad = Math.round(Math.max(W, H) * padFrac);
  const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
  const x1 = Math.min(W, maxX + pad + 1), y1 = Math.min(H, maxY + pad + 1);
  const rw = x1 - x0, rh = y1 - y0;
  const region = { left: x0, top: y0, width: rw, height: rh };

  const s = Math.min(1, maxSide / Math.max(rw, rh));
  const mw = round32(rw * s), mh = round32(rh * s), n = mw * mh;

  const regAlpha = new Float32Array(rw * rh);
  for (let y = 0; y < rh; y++) regAlpha.set(alpha.subarray((y + y0) * W + x0, (y + y0) * W + x1), y * rw);
  const lowA = resizeBilinear(regAlpha, rw, rh, mw, mh);
  const lowRgb = await resizeRegion(region, mw, mh);

  // Trimap: unknown = uncertain pixels dilated by a band.
  const unk = new Float32Array(n);
  for (let i = 0; i < n; i++) unk[i] = lowA[i] > lo && lowA[i] < hi ? 1 : 0;
  const band = Math.max(3, Math.round(Math.max(mw, mh) * bandFrac));
  const dil = boxFilter(unk, mw, mh, band);
  const tri = new Float32Array(n), isU = new Float32Array(n);
  let unknownPx = 0;
  for (let i = 0; i < n; i++) {
    if (dil[i] > 1e-6) { tri[i] = 0.5; isU[i] = 1; unknownPx++; } else tri[i] = lowA[i] >= 0.5 ? 1 : 0;
  }

  // RGB normalised (x-0.5)/0.5, trimap in [0,1] (HF VitMatteImageProcessor).
  const data = new Float32Array(4 * n);
  for (let i = 0; i < n; i++) {
    data[i] = lowRgb[i * 3] / 127.5 - 1;
    data[n + i] = lowRgb[i * 3 + 1] / 127.5 - 1;
    data[2 * n + i] = lowRgb[i * 3 + 2] / 127.5 - 1;
    data[3 * n + i] = tri[i];
  }
  const t = Date.now();
  const raw = await infer(data, mh, mw);
  const inferMs = Date.now() - t;
  const matte = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = isU[i] ? raw[i] : tri[i];
    matte[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }

  // Edge-aware upsample to region resolution; blend only inside the band.
  const regRgb = new Uint8Array(rw * rh * 3);
  for (let y = 0; y < rh; y++)
    regRgb.set(rgb.subarray(((y + y0) * W + x0) * 3, ((y + y0) * W + x1) * 3), y * rw * 3);
  const up = fastColorGuidedFilter(lowRgb, matte, mw, mh, regRgb, rw, rh, 1, 1e-5);
  const wBand = resizeBilinear(boxFilter(isU, mw, mh, 1), mw, mh, rw, rh);
  const out = new Float32Array(alpha);
  for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) {
    const l = y * rw + x, w = wBand[l];
    if (w <= 0) continue;
    const g = (y + y0) * W + x + x0;
    let v = w * up[l] + (1 - w) * alpha[g];
    if (v < 0.01) v = 0; else if (v > 0.99) v = 1;
    out[g] = v;
  }
  return { alpha: out, inferMs, region, work: `${mw}x${mh}`, unknownRatio: unknownPx / n };
}
