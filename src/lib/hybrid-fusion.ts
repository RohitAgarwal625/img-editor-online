import sharp from "sharp";
import { removeBackgroundWithBiRefNet } from "./birefnet";
import { removeBackgroundWithModnet } from "./modnet";

export interface HybridFusionResult {
  pngBuffer: Buffer;
  inferenceTimeMs: number;
  width: number;
  height: number;
}

/**
 * Fuses BiRefNet (semantic core certainty) with MODNet (high-frequency hair matting)
 * into a single unified cutout.
 */
export async function removeBackgroundWithHybridFusion(
  inputBuffer: Buffer
): Promise<HybridFusionResult> {
  const t0 = Date.now();

  // 1. Run both models concurrently in parallel
  const [birefRes, modnetRes] = await Promise.all([
    removeBackgroundWithBiRefNet(inputBuffer),
    removeBackgroundWithModnet(inputBuffer, 512),
  ]);

  const origMeta = await sharp(inputBuffer).metadata();
  const w = origMeta.width || birefRes.width;
  const h = origMeta.height || birefRes.height;
  const N = w * h;

  // Extract raw RGBA channels from both model cutouts
  const [{ data: bRgba }, { data: mRgba }, { data: origRgb }] = await Promise.all([
    sharp(birefRes.pngBuffer).resize(w, h).raw().toBuffer({ resolveWithObject: true }),
    sharp(modnetRes.pngBuffer).resize(w, h).raw().toBuffer({ resolveWithObject: true }),
    sharp(inputBuffer).resize(w, h).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  const fusedRgba = Buffer.alloc(N * 4);

  for (let i = 0; i < N; i++) {
    const aB = bRgba[i * 4 + 3];
    const aM = mRgba[i * 4 + 3];

    let aF: number;
    if (aM < 10) {
      // Definite background in MODNet: eliminate background structure leaks
      aF = 0;
    } else if (aM > 230) {
      // Deep inner body: 100% solid, no interior holes
      aF = 255;
    } else {
      // Edge transition & fine hair: blend MODNet sub-pixel strands with BiRefNet edge support
      aF = Math.round(aM * 0.85 + (aB > 20 ? aB : aM) * 0.15);
    }

    fusedRgba[i * 4] = origRgb[i * 3];
    fusedRgba[i * 4 + 1] = origRgb[i * 3 + 1];
    fusedRgba[i * 4 + 2] = origRgb[i * 3 + 2];
    fusedRgba[i * 4 + 3] = Math.min(255, Math.max(0, aF));
  }

  const pngBuffer = await sharp(fusedRgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 7 })
    .toBuffer();

  const totalTimeMs = Date.now() - t0;

  return {
    pngBuffer,
    inferenceTimeMs: totalTimeMs,
    width: w,
    height: h,
  };
}
