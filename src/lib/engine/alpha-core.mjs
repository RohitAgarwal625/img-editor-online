/**
 * Pure, dependency-free alpha-matte algorithms shared by the production
 * pipeline, the benchmark harness and the unit tests.
 *
 * Conventions: alpha / guide planes are Float32Array in [0, 1], row-major.
 * RGB images are interleaved Uint8Array/Buffer (3 channels).
 */

/** Numerically safe logistic. */
export function sigmoid(x) {
  if (x >= 0) return 1 / (1 + Math.exp(-x));
  const e = Math.exp(x);
  return e / (1 + e);
}

/**
 * O(N) box mean filter with edge clamping (normalised by true window size,
 * so borders are not darkened).
 * @param {Float32Array} src @param {number} w @param {number} h @param {number} r
 * @returns {Float32Array}
 */
export function boxFilter(src, w, h, r) {
  const tmp = new Float32Array(w * h);
  const dst = new Float32Array(w * h);
  if (r <= 0) { dst.set(src); return dst; }
  for (let y = 0; y < h; y++) {
    const o = y * w;
    let sum = 0, cnt = 0;
    for (let x = 0; x <= Math.min(r, w - 1); x++) { sum += src[o + x]; cnt++; }
    for (let x = 0; x < w; x++) {
      tmp[o + x] = sum / cnt;
      const add = x + r + 1, rem = x - r;
      if (add < w) { sum += src[o + add]; cnt++; }
      if (rem >= 0) { sum -= src[o + rem]; cnt--; }
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0, cnt = 0;
    for (let y = 0; y <= Math.min(r, h - 1); y++) { sum += tmp[y * w + x]; cnt++; }
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = sum / cnt;
      const add = y + r + 1, rem = y - r;
      if (add < h) { sum += tmp[add * w + x]; cnt++; }
      if (rem >= 0) { sum -= tmp[rem * w + x]; cnt--; }
    }
  }
  return dst;
}

/**
 * Bilinear resize of a single float plane (pixel-centre aligned).
 * @param {Float32Array} src @param {number} sw @param {number} sh @param {number} dw @param {number} dh
 */
export function resizeBilinear(src, sw, sh, dw, dh) {
  const dst = new Float32Array(dw * dh);
  const sx = sw / dw, sy = sh / dh;
  const x0s = new Int32Array(dw), x1s = new Int32Array(dw), fxs = new Float32Array(dw);
  for (let x = 0; x < dw; x++) {
    const fx = Math.min(sw - 1, Math.max(0, (x + 0.5) * sx - 0.5));
    x0s[x] = Math.floor(fx); x1s[x] = Math.min(sw - 1, x0s[x] + 1); fxs[x] = fx - x0s[x];
  }
  for (let y = 0; y < dh; y++) {
    const fy = Math.min(sh - 1, Math.max(0, (y + 0.5) * sy - 0.5));
    const y0 = Math.floor(fy), y1 = Math.min(sh - 1, y0 + 1), wy = fy - y0;
    const r0 = y0 * sw, r1 = y1 * sw, o = y * dw;
    for (let x = 0; x < dw; x++) {
      const a = src[r0 + x0s[x]], b = src[r0 + x1s[x]], c = src[r1 + x0s[x]], d = src[r1 + x1s[x]];
      const t = a + (b - a) * fxs[x];
      const u = c + (d - c) * fxs[x];
      dst[o + x] = t + (u - t) * wy;
    }
  }
  return dst;
}

/** Split interleaved RGB bytes into three [0,1] float planes. */
export function rgbToPlanes(rgb, n) {
  const R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n);
  for (let i = 0; i < n; i++) { R[i] = rgb[i * 3] / 255; G[i] = rgb[i * 3 + 1] / 255; B[i] = rgb[i * 3 + 2] / 255; }
  return [R, G, B];
}

/**
 * Colour guided filter (He et al., TPAMI 2013) computed at low resolution and
 * applied at full resolution ("fast guided filter", He & Sun 2015).
 * Returns the refined full-resolution alpha.
 *
 * @param {Uint8Array} lowRgb   guide at low res (interleaved RGB)
 * @param {Float32Array} lowP   input alpha at low res
 * @param {number} lw @param {number} lh
 * @param {Uint8Array} fullRgb  guide at full res (interleaved RGB)
 * @param {number} W @param {number} H
 * @param {number} r radius at low res @param {number} eps regulariser
 */
export function fastColorGuidedFilter(lowRgb, lowP, lw, lh, fullRgb, W, H, r, eps) {
  const n = lw * lh;
  const [Ir, Ig, Ib] = rgbToPlanes(lowRgb, n);
  const mul = (a, b) => { const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = a[i] * b[i]; return o; };
  const f = (a) => boxFilter(a, lw, lh, r);
  const mR = f(Ir), mG = f(Ig), mB = f(Ib), mP = f(lowP);
  const mRP = f(mul(Ir, lowP)), mGP = f(mul(Ig, lowP)), mBP = f(mul(Ib, lowP));
  const vRR = f(mul(Ir, Ir)), vRG = f(mul(Ir, Ig)), vRB = f(mul(Ir, Ib));
  const vGG = f(mul(Ig, Ig)), vGB = f(mul(Ig, Ib)), vBB = f(mul(Ib, Ib));
  const aR = new Float32Array(n), aG = new Float32Array(n), aB = new Float32Array(n), b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const cR = mRP[i] - mR[i] * mP[i], cG = mGP[i] - mG[i] * mP[i], cB = mBP[i] - mB[i] * mP[i];
    const rr = vRR[i] - mR[i] * mR[i] + eps, rg = vRG[i] - mR[i] * mG[i], rb = vRB[i] - mR[i] * mB[i];
    const gg = vGG[i] - mG[i] * mG[i] + eps, gb = vGB[i] - mG[i] * mB[i], bb = vBB[i] - mB[i] * mB[i] + eps;
    // Symmetric 3x3 inverse via cofactors.
    const i00 = gg * bb - gb * gb, i01 = gb * rb - rg * bb, i02 = rg * gb - gg * rb;
    const i11 = rr * bb - rb * rb, i12 = rb * rg - rr * gb, i22 = rr * gg - rg * rg;
    const det = rr * i00 + rg * i01 + rb * i02;
    const inv = Math.abs(det) > 1e-12 ? 1 / det : 0;
    aR[i] = (i00 * cR + i01 * cG + i02 * cB) * inv;
    aG[i] = (i01 * cR + i11 * cG + i12 * cB) * inv;
    aB[i] = (i02 * cR + i12 * cG + i22 * cB) * inv;
    b[i] = mP[i] - aR[i] * mR[i] - aG[i] * mG[i] - aB[i] * mB[i];
  }
  const up = (a) => resizeBilinear(f(a), lw, lh, W, H);
  const AR = up(aR), AG = up(aG), AB = up(aB), BB = up(b);
  const N = W * H, q = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const v = AR[i] * fullRgb[i * 3] / 255 + AG[i] * fullRgb[i * 3 + 1] / 255 + AB[i] * fullRgb[i * 3 + 2] / 255 + BB[i];
    q[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return q;
}

/**
 * Boolean "unknown" band: pixels within `r` of any semi-transparent pixel.
 * Guided refinement is restricted to this band so that confident fg/bg
 * (including legitimate internal holes) is never altered.
 * @returns {Uint8Array}
 */
export function uncertaintyBand(alpha, w, h, r, lo = 0.02, hi = 0.98) {
  const n = w * h, u = new Float32Array(n);
  for (let i = 0; i < n; i++) u[i] = alpha[i] > lo && alpha[i] < hi ? 1 : 0;
  // Also include hard edges (adjacent fg/bg transitions) so a binary-ish
  // prediction can still be softened along true image edges.
  for (let y = 0; y < h; y++) for (let x = 1; x < w; x++) {
    const i = y * w + x;
    if ((alpha[i] >= 0.5) !== (alpha[i - 1] >= 0.5)) { u[i] = 1; u[i - 1] = 1; }
  }
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if ((alpha[i] >= 0.5) !== (alpha[i - w] >= 0.5)) { u[i] = 1; u[i - w] = 1; }
  }
  const d = boxFilter(u, w, h, r), out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = d[i] > 1e-6 ? 1 : 0;
  return out;
}

/**
 * Label 4-connected components of `mask` (Uint8 0/1). Returns labels (0 = none)
 * and per-label area + border-touch flags.
 */
export function connectedComponents(mask, w, h) {
  const labels = new Int32Array(w * h);
  const areas = [0], touches = [false];
  const stack = new Int32Array(w * h);
  let next = 0;
  for (let s = 0; s < w * h; s++) {
    if (!mask[s] || labels[s]) continue;
    next++;
    let sp = 0, area = 0, touch = false;
    stack[sp++] = s; labels[s] = next;
    while (sp) {
      const i = stack[--sp]; area++;
      const x = i % w, y = (i - x) / w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touch = true;
      if (x > 0 && mask[i - 1] && !labels[i - 1]) { labels[i - 1] = next; stack[sp++] = i - 1; }
      if (x < w - 1 && mask[i + 1] && !labels[i + 1]) { labels[i + 1] = next; stack[sp++] = i + 1; }
      if (y > 0 && mask[i - w] && !labels[i - w]) { labels[i - w] = next; stack[sp++] = i - w; }
      if (y < h - 1 && mask[i + w] && !labels[i + w]) { labels[i + w] = next; stack[sp++] = i + w; }
    }
    areas.push(area); touches.push(touch);
  }
  return { labels, areas, touches, count: next };
}

/**
 * Connected-component cleanup on a (low-res) alpha:
 *  - removes small detached foreground specks (background leakage),
 *  - fills only *pin-holes* (tiny enclosed background blobs). Real internal
 *    gaps (cup handles, bicycle frames, between arms) are preserved.
 * Pixels belonging to a removed speck are zeroed together with their soft
 * fringe (any alpha within the speck's 1px neighbourhood).
 */
export function cleanupComponents(alpha, w, h, opts = {}) {
  const n = w * h;
  const minIslandFrac = opts.minIslandFrac ?? 0.0015; // of image area
  const minIslandRel = opts.minIslandRel ?? 0.02;     // of largest component
  const maxPinholeFrac = opts.maxPinholeFrac ?? 0.00004;
  const out = new Float32Array(alpha);
  const fg = new Uint8Array(n);
  for (let i = 0; i < n; i++) fg[i] = alpha[i] >= 0.5 ? 1 : 0;
  const cc = connectedComponents(fg, w, h);
  let largest = 0;
  for (let k = 1; k <= cc.count; k++) largest = Math.max(largest, cc.areas[k]);
  const keep = new Uint8Array(cc.count + 1);
  let removed = 0;
  for (let k = 1; k <= cc.count; k++) {
    const a = cc.areas[k];
    keep[k] = a >= largest * minIslandRel || a >= n * minIslandFrac ? 1 : 0;
    if (!keep[k]) removed++;
  }
  if (removed) {
    for (let i = 0; i < n; i++) {
      const l = cc.labels[i];
      if (l && !keep[l]) out[i] = 0;
    }
  }
  const bg = new Uint8Array(n);
  for (let i = 0; i < n; i++) bg[i] = out[i] < 0.5 ? 1 : 0;
  const hc = connectedComponents(bg, w, h);
  let filled = 0;
  for (let i = 0; i < n; i++) {
    const l = hc.labels[i];
    if (l && !hc.touches[l] && hc.areas[l] <= n * maxPinholeFrac) { out[i] = Math.max(out[i], 1); filled++; }
  }
  return { alpha: out, removedIslands: removed, filledPinholePixels: filled, components: cc.count - removed };
}

/**
 * Approximate fast foreground colour estimation by "blur fusion"
 * (Forte & Pitié, "Approximate Fast Foreground Colour Estimation", ICIP 2021).
 * Two passes: a large radius pass at reduced resolution (low frequency) and a
 * small radius pass at full resolution. Pixels with alpha == 1 keep their
 * original RGB exactly; only semi-transparent pixels are decontaminated.
 *
 * @param {Uint8Array} rgb full-res interleaved RGB
 * @param {Float32Array} alpha full-res alpha
 * @returns {Uint8Array} interleaved RGBA, straight (un-premultiplied) alpha
 */
export function estimateForegroundRGBA(rgb, alpha, W, H, opts = {}) {
  const N = W * H;
  const eps = 1e-5;
  const ds = Math.max(1, Math.round(opts.downscale ?? Math.max(W, H) / 1024));
  const rLarge = opts.rLarge ?? 90, rSmall = opts.rSmall ?? 6;
  const I = rgbToPlanes(rgb, N);

  /** one blur-fusion iteration on given planes */
  const pass = (img, F, B, a, w, h, r) => {
    const n = w * h;
    const bA = boxFilter(a, w, h, r);
    const nF = [], nB = [];
    for (let c = 0; c < 3; c++) {
      const fa = new Float32Array(n), b1a = new Float32Array(n);
      for (let i = 0; i < n; i++) { fa[i] = F[c][i] * a[i]; b1a[i] = B[c][i] * (1 - a[i]); }
      const bFA = boxFilter(fa, w, h, r), bB1A = boxFilter(b1a, w, h, r);
      const outF = new Float32Array(n), outB = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const bf = bFA[i] / (bA[i] + eps);
        const bb = bB1A[i] / (1 - bA[i] + eps);
        const ai = a[i];
        let f = bf + ai * (img[c][i] - ai * bf - (1 - ai) * bb);
        f = f < 0 ? 0 : f > 1 ? 1 : f;
        outF[i] = f; outB[i] = bb;
      }
      nF.push(outF); nB.push(outB);
    }
    return [nF, nB];
  };

  // Large-radius pass at low resolution.
  const lw = Math.max(1, Math.round(W / ds)), lh = Math.max(1, Math.round(H / ds));
  const aL = resizeBilinear(alpha, W, H, lw, lh);
  const IL = I.map((p) => resizeBilinear(p, W, H, lw, lh));
  let [FL, BL] = pass(IL, IL, IL, aL, lw, lh, Math.max(1, Math.round(rLarge / ds)));
  // Upsample estimates and run fine pass at full resolution.
  let F = FL.map((p) => resizeBilinear(p, lw, lh, W, H));
  let B = BL.map((p) => resizeBilinear(p, lw, lh, W, H));
  [F] = pass(I, F, B, alpha, W, H, rSmall);

  const out = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const a = alpha[i];
    const o = i * 4;
    if (a >= 0.999) {
      out[o] = rgb[i * 3]; out[o + 1] = rgb[i * 3 + 1]; out[o + 2] = rgb[i * 3 + 2];
    } else {
      out[o] = Math.round(F[0][i] * 255); out[o + 1] = Math.round(F[1][i] * 255); out[o + 2] = Math.round(F[2][i] * 255);
    }
    out[o + 3] = Math.round((a < 0 ? 0 : a > 1 ? 1 : a) * 255);
  }
  return out;
}

/**
 * Lightweight QA metrics on an alpha plane (any resolution).
 * Thresholds that consume these metrics live in the pipeline config and are
 * documented in docs/ENGINE.md together with the benchmark that calibrates them.
 */
export function assessAlpha(alpha, w, h) {
  const n = w * h;
  let fg = 0, soft = 0, perim = 0, borderFg = 0, borderN = 0;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, a = alpha[i];
    const isFg = a >= 0.5;
    if (isFg) { fg++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    if (a > 0.05 && a < 0.95) soft++;
    if (x > 0 && isFg !== (alpha[i - 1] >= 0.5)) perim++;
    if (y > 0 && isFg !== (alpha[i - w] >= 0.5)) perim++;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) { borderN++; if (isFg) borderFg++; }
  }
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = alpha[i] >= 0.5 ? 1 : 0;
  const cc = connectedComponents(mask, w, h);
  const inv = new Uint8Array(n);
  for (let i = 0; i < n; i++) inv[i] = mask[i] ? 0 : 1;
  const hc = connectedComponents(inv, w, h);
  let holeArea = 0, holes = 0;
  for (let k = 1; k <= hc.count; k++) if (!hc.touches[k]) { holes++; holeArea += hc.areas[k]; }
  const diag = Math.sqrt(w * w + h * h);
  return {
    fgRatio: fg / n,
    softRatio: soft / n,
    // Mean width (px at this resolution) of the semi-transparent band per unit of contour.
    softBandWidth: perim ? soft / perim : 0,
    // Contour length relative to the bbox perimeter: high => jagged/fragmented edge.
    contourComplexity: maxX >= 0 ? perim / (2 * (maxX - minX + 1 + maxY - minY + 1)) : 0,
    borderFgRatio: borderN ? borderFg / borderN : 0,
    components: cc.count,
    enclosedHoles: holes,
    enclosedHoleRatio: fg ? holeArea / fg : 0,
    bbox: maxX >= 0 ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null,
    bboxAreaRatio: maxX >= 0 ? ((maxX - minX + 1) * (maxY - minY + 1)) / n : 0,
    perimeterPerDiag: perim / diag,
  };
}

/**
 * Standard alpha-matting error metrics (Rhemann et al. 2009) against ground truth.
 * SAD is reported in thousands (x1e-3) as is customary; MSE in x1e-3.
 */
export function mattingMetrics(pred, gt, w, h) {
  const n = w * h;
  let sad = 0, mse = 0;
  for (let i = 0; i < n; i++) { const d = pred[i] - gt[i]; sad += Math.abs(d); mse += d * d; }
  // Gradient error with simple central differences.
  let grad = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gpx = (pred[i + 1] - pred[i - 1]) / 2, gpy = (pred[i + w] - pred[i - w]) / 2;
    const ggx = (gt[i + 1] - gt[i - 1]) / 2, ggy = (gt[i + w] - gt[i - w]) / 2;
    const d = Math.hypot(gpx, gpy) - Math.hypot(ggx, ggy);
    grad += d * d;
  }
  // IoU at 0.5 and boundary F-measure-lite (edge band IoU).
  let inter = 0, uni = 0;
  for (let i = 0; i < n; i++) { const p = pred[i] >= 0.5, g = gt[i] >= 0.5; if (p && g) inter++; if (p || g) uni++; }
  return { sad: sad / 1000, mse: (mse / n) * 1000, grad: grad / 1000, iou: uni ? inter / uni : 1 };
}
