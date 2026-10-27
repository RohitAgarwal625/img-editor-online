/**
 * Tiled blur-fusion foreground estimation (Forte & Pitié, ICIP 2021).
 *
 * Same maths as alpha-core.estimateForegroundRGBA, but:
 *  - the large-radius pass runs once on an area-downsampled image (<=1024px),
 *  - the small-radius full-resolution pass runs ONLY on tiles that contain
 *    semi-transparent pixels (plus a halo of rSmall so box filters are exact),
 *  - opaque / transparent pixels are written straight from the source RGB.
 * On 20-30 MP photos the soft band is typically 1-6 % of pixels, so this
 * avoids ~7 full-resolution box filters over the whole frame.
 */
import { boxFilter } from "./alpha-core.mjs";

const EPS = 1e-5;

/** Area (box) downsample of interleaved RGB + alpha into float planes. */
function downsample(rgb, alpha, W, H, lw, lh) {
  const n = lw * lh;
  const R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n), A = new Float32Array(n), C = new Float32Array(n);
  for (let y = 0; y < H; y++) {
    const ly = Math.min(lh - 1, Math.floor((y * lh) / H));
    for (let x = 0; x < W; x++) {
      const lx = Math.min(lw - 1, Math.floor((x * lw) / W));
      const j = ly * lw + lx, i = y * W + x;
      R[j] += rgb[i * 3]; G[j] += rgb[i * 3 + 1]; B[j] += rgb[i * 3 + 2]; A[j] += alpha[i]; C[j]++;
    }
  }
  for (let j = 0; j < n; j++) { const c = C[j] || 1; R[j] /= 255 * c; G[j] /= 255 * c; B[j] /= 255 * c; A[j] /= c; }
  return { I: [R, G, B], A };
}

/** One blur-fusion iteration. Returns [F planes, B planes]. */
function pass(img, F, Bk, a, w, h, r) {
  const n = w * h;
  const bA = boxFilter(a, w, h, r);
  const nF = [], nB = [];
  for (let c = 0; c < 3; c++) {
    const fa = new Float32Array(n), b1a = new Float32Array(n);
    for (let i = 0; i < n; i++) { fa[i] = F[c][i] * a[i]; b1a[i] = Bk[c][i] * (1 - a[i]); }
    const bFA = boxFilter(fa, w, h, r), bB1A = boxFilter(b1a, w, h, r);
    const oF = new Float32Array(n), oB = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const bf = bFA[i] / (bA[i] + EPS), bb = bB1A[i] / (1 - bA[i] + EPS), ai = a[i];
      const f = bf + ai * (img[c][i] - ai * bf - (1 - ai) * bb);
      oF[i] = f < 0 ? 0 : f > 1 ? 1 : f; oB[i] = bb;
    }
    nF.push(oF); nB.push(oB);
  }
  return [nF, nB];
}

/** Bilinear sample of a low-res plane into a full-res sub-rectangle. */
function sampleRegion(src, lw, lh, W, H, x0, y0, tw, th) {
  const out = new Float32Array(tw * th), sx = lw / W, sy = lh / H;
  for (let y = 0; y < th; y++) {
    const fy = Math.min(lh - 1, Math.max(0, (y + y0 + 0.5) * sy - 0.5));
    const ya = Math.floor(fy), yb = Math.min(lh - 1, ya + 1), wy = fy - ya;
    for (let x = 0; x < tw; x++) {
      const fx = Math.min(lw - 1, Math.max(0, (x + x0 + 0.5) * sx - 0.5));
      const xa = Math.floor(fx), xb = Math.min(lw - 1, xa + 1), wx = fx - xa;
      const t = src[ya * lw + xa] * (1 - wx) + src[ya * lw + xb] * wx;
      const u = src[yb * lw + xa] * (1 - wx) + src[yb * lw + xb] * wx;
      out[y * tw + x] = t + (u - t) * wy;
    }
  }
  return out;
}

/**
 * @param {Uint8Array} rgb full-res interleaved RGB
 * @param {Float32Array} alpha full-res alpha in [0,1]
 * @returns {{ rgba: Uint8Array, softTiles: number, totalTiles: number }}
 */
export function estimateForegroundTiled(rgb, alpha, W, H, opts = {}) {
  const N = W * H;
  const lo = opts.lo ?? 0.004, hi = opts.hi ?? 0.996;
  const rLarge = opts.rLarge ?? 90, rSmall = opts.rSmall ?? 6, T = opts.tile ?? 256;

  const out = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    out[i * 4] = rgb[i * 3]; out[i * 4 + 1] = rgb[i * 3 + 1]; out[i * 4 + 2] = rgb[i * 3 + 2];
    const a = alpha[i]; out[i * 4 + 3] = Math.round((a < 0 ? 0 : a > 1 ? 1 : a) * 255);
  }

  // Which tiles contain soft pixels?
  const tx = Math.ceil(W / T), ty = Math.ceil(H / T), soft = new Uint8Array(tx * ty);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = alpha[y * W + x];
    if (a > lo && a < hi) soft[((y / T) | 0) * tx + ((x / T) | 0)] = 1;
  }
  let softTiles = 0; for (const s of soft) softTiles += s;
  if (!softTiles) return { rgba: out, softTiles, totalTiles: tx * ty };

  // Global low-frequency pass.
  const ds = Math.max(1, Math.max(W, H) / 1024);
  const lw = Math.max(1, Math.round(W / ds)), lh = Math.max(1, Math.round(H / ds));
  const L = downsample(rgb, alpha, W, H, lw, lh);
  const [FL, BL] = pass(L.I, L.I, L.I, L.A, lw, lh, Math.max(1, Math.round(rLarge / ds)));

  // Fine pass per soft tile with an rSmall halo.
  for (let t = 0; t < tx * ty; t++) {
    if (!soft[t]) continue;
    const cx = (t % tx) * T, cy = ((t / tx) | 0) * T;
    const x0 = Math.max(0, cx - rSmall), y0 = Math.max(0, cy - rSmall);
    const x1 = Math.min(W, cx + T + rSmall), y1 = Math.min(H, cy + T + rSmall);
    const tw = x1 - x0, th = y1 - y0, n = tw * th;
    const I = [new Float32Array(n), new Float32Array(n), new Float32Array(n)], a = new Float32Array(n);
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      const g = (y + y0) * W + x + x0, l = y * tw + x;
      I[0][l] = rgb[g * 3] / 255; I[1][l] = rgb[g * 3 + 1] / 255; I[2][l] = rgb[g * 3 + 2] / 255; a[l] = alpha[g];
    }
    const F = FL.map((p) => sampleRegion(p, lw, lh, W, H, x0, y0, tw, th));
    const B = BL.map((p) => sampleRegion(p, lw, lh, W, H, x0, y0, tw, th));
    const [Ff] = pass(I, F, B, a, tw, th, rSmall);
    const ex = Math.min(W, cx + T), ey = Math.min(H, cy + T);
    for (let y = cy; y < ey; y++) for (let x = cx; x < ex; x++) {
      const g = y * W + x, av = alpha[g];
      if (av <= lo || av >= hi) continue; // keep exact source RGB
      const l = (y - y0) * tw + (x - x0);
      out[g * 4] = Math.round(Ff[0][l] * 255); out[g * 4 + 1] = Math.round(Ff[1][l] * 255); out[g * 4 + 2] = Math.round(Ff[2][l] * 255);
    }
  }
  return { rgba: out, softTiles, totalTiles: tx * ty };
}
