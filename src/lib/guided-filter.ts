import sharp from "sharp";

/**
 * 1D separable box filter in O(W * H) linear time.
 */
function boxFilter1D(
  src: Float32Array,
  dst: Float32Array,
  w: number,
  h: number,
  r: number
): void {
  const temp = new Float32Array(w * h);
  const inv = 1 / (2 * r + 1);

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    let sum = 0;
    for (let x = -r; x <= r; x++) {
      const px = Math.min(w - 1, Math.max(0, x));
      sum += src[rowOffset + px];
    }
    temp[rowOffset] = sum * inv;
    for (let x = 1; x < w; x++) {
      const addX = Math.min(w - 1, x + r);
      const remX = Math.max(0, x - r - 1);
      sum += src[rowOffset + addX] - src[rowOffset + remX];
      temp[rowOffset + x] = sum * inv;
    }
  }

  // Vertical pass
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) {
      const py = Math.min(h - 1, Math.max(0, y));
      sum += temp[py * w + x];
    }
    dst[x] = sum * inv;
    for (let y = 1; y < h; y++) {
      const addY = Math.min(h - 1, y + r);
      const remY = Math.max(0, y - r - 1);
      sum += temp[addY * w + x] - temp[remY * w + x];
      dst[y * w + x] = sum * inv;
    }
  }
}

export interface GuidedFilterOptions {
  radius?: number;
  eps?: number;
}

/**
 * Applies He et al.'s Guided Image Filter to refine an initial alpha mask using the original RGB photo.
 * Aligns alpha transitions with photographic luminance edges and hair strands.
 */
export async function refineAlphaWithGuidedFilter(
  imageBuffer: Buffer,
  alphaBuffer: Buffer,
  options: GuidedFilterOptions = {}
): Promise<Buffer> {
  const r = options.radius ?? 5;
  const eps = options.eps ?? 1e-3;

  const original = sharp(imageBuffer);
  const meta = await original.metadata();
  const w = meta.width || 800;
  const h = meta.height || 600;
  const N = w * h;

  const { data: rgb } = await original.removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // alphaBuffer might be an RGBA PNG cutout, grayscale mask, or raw bytes
  let alphaSharp = sharp(alphaBuffer);
  const alphaMeta = await alphaSharp.metadata();

  if (alphaMeta.width !== w || alphaMeta.height !== h) {
    alphaSharp = alphaSharp.resize(w, h, { fit: "fill" });
  }

  let rawAlpha: Buffer;
  if (alphaMeta.channels === 4) {
    // Extract alpha channel from RGBA cutout
    rawAlpha = await alphaSharp.extractChannel(3).raw().toBuffer();
  } else {
    // Grayscale mask
    rawAlpha = await alphaSharp.toColourspace("b-w").raw().toBuffer();
  }

  const I = new Float32Array(N);
  const p = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    // Luminance guide [0, 1]
    I[i] = (0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2]) / 255.0;
    // Input alpha [0, 1]
    p[i] = rawAlpha[i] / 255.0;
  }

  const mean_I = new Float32Array(N);
  const mean_p = new Float32Array(N);
  const mean_Ip = new Float32Array(N);
  const mean_II = new Float32Array(N);

  const Ip = new Float32Array(N);
  const II = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    Ip[i] = I[i] * p[i];
    II[i] = I[i] * I[i];
  }

  boxFilter1D(I, mean_I, w, h, r);
  boxFilter1D(p, mean_p, w, h, r);
  boxFilter1D(Ip, mean_Ip, w, h, r);
  boxFilter1D(II, mean_II, w, h, r);

  const a = new Float32Array(N);
  const b = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const var_I = mean_II[i] - mean_I[i] * mean_I[i];
    const cov_Ip = mean_Ip[i] - mean_I[i] * mean_p[i];
    a[i] = cov_Ip / (var_I + eps);
    b[i] = mean_p[i] - a[i] * mean_I[i];
  }

  const mean_a = new Float32Array(N);
  const mean_b = new Float32Array(N);
  boxFilter1D(a, mean_a, w, h, r);
  boxFilter1D(b, mean_b, w, h, r);

  const finalRgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const q = mean_a[i] * I[i] + mean_b[i];
    const alphaVal = Math.max(0, Math.min(255, Math.round(q * 255)));

    finalRgba[i * 4] = rgb[i * 3];
    finalRgba[i * 4 + 1] = rgb[i * 3 + 1];
    finalRgba[i * 4 + 2] = rgb[i * 3 + 2];
    finalRgba[i * 4 + 3] = alphaVal;
  }

  return await sharp(finalRgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 7 })
    .toBuffer();
}
