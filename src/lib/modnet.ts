import path from "path";
import fs from "fs";
import sharp from "sharp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSession: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrt(): Promise<any> {
  const mod = await import("onnxruntime-node");
  if (mod.InferenceSession) return mod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((mod as any).default?.InferenceSession) return (mod as any).default;
  return mod;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getModnetSession(): Promise<any> {
  if (cachedSession) return cachedSession;

  const modelPath = path.join(process.cwd(), "models", "modnet.onnx");
  if (!fs.existsSync(modelPath)) {
    throw new Error(`MODNet model not found at ${modelPath}`);
  }

  const ort = await getOrt();
  cachedSession = await ort.InferenceSession.create(modelPath, {
    executionProviders: ["cpu"],
    graphOptimizationLevel: "all",
  });

  return cachedSession;
}

export interface ModnetResult {
  pngBuffer: Buffer;
  inferenceTimeMs: number;
  width: number;
  height: number;
}

/**
 * Executes MODNet portrait matting on an input image buffer or file.
 * Returns transparent PNG buffer with continuous alpha matting.
 */
export async function removeBackgroundWithModnet(
  inputBuffer: Buffer,
  refSize = 512
): Promise<ModnetResult> {
  const t0 = Date.now();
  const session = await getModnetSession();
  const ort = await getOrt();

  // 1. Image metadata
  const original = sharp(inputBuffer);
  const metadata = await original.metadata();
  const origW = metadata.width || 800;
  const origH = metadata.height || 600;

  // 2. Compute dynamic input dimension (multiples of 32)
  let targetW: number, targetH: number;
  if (origW >= origH) {
    targetH = refSize;
    targetW = Math.round((origW / origH) * refSize);
  } else {
    targetW = refSize;
    targetH = Math.round((origH / origW) * refSize);
  }
  targetW = targetW - (targetW % 32);
  targetH = targetH - (targetH % 32);

  // 3. Resize and extract raw RGB
  const { data: rawRgb } = await sharp(inputBuffer)
    .resize(targetW, targetH, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 4. Construct NCHW tensor normalized to [-1, 1]
  const planeSize = targetH * targetW;
  const floatData = new Float32Array(3 * planeSize);

  for (let i = 0; i < planeSize; i++) {
    const r = rawRgb[i * 3];
    const g = rawRgb[i * 3 + 1];
    const b = rawRgb[i * 3 + 2];

    floatData[i] = r / 127.5 - 1.0;
    floatData[planeSize + i] = g / 127.5 - 1.0;
    floatData[2 * planeSize + i] = b / 127.5 - 1.0;
  }

  const inputTensor = new ort.Tensor("float32", floatData, [1, 3, targetH, targetW]);

  // 5. Run inference
  const results = await session.run({ input: inputTensor });
  const matteData = results.output.data as Float32Array;

  // 6. 8-bit matte buffer
  const matteBuffer = Buffer.alloc(planeSize);
  for (let i = 0; i < planeSize; i++) {
    const val = Math.max(0, Math.min(1, matteData[i]));
    matteBuffer[i] = Math.round(val * 255);
  }

  // 7. Upsample matte to original dimensions with 1-channel grayscale
  const { data: fullMatte } = await sharp(matteBuffer, {
    raw: { width: targetW, height: targetH, channels: 1 },
  })
    .resize(origW, origH, { kernel: "lanczos3" })
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 8. Composite original RGB + MODNet alpha channel
  const { data: origRgb } = await sharp(inputBuffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgbaBuffer = Buffer.alloc(origW * origH * 4);
  for (let i = 0; i < origW * origH; i++) {
    rgbaBuffer[i * 4] = origRgb[i * 3];
    rgbaBuffer[i * 4 + 1] = origRgb[i * 3 + 1];
    rgbaBuffer[i * 4 + 2] = origRgb[i * 3 + 2];
    rgbaBuffer[i * 4 + 3] = fullMatte[i];
  }

  const pngBuffer = await sharp(rgbaBuffer, {
    raw: { width: origW, height: origH, channels: 4 },
  })
    .png({ compressionLevel: 7 })
    .toBuffer();

  const inferenceTimeMs = Date.now() - t0;

  return {
    pngBuffer,
    inferenceTimeMs,
    width: origW,
    height: origH,
  };
}
