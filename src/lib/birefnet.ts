import path from "path";
import fs from "fs";
import sharp from "sharp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedBiRefNetSession: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrt(): Promise<any> {
  const mod = await import("onnxruntime-node");
  if (mod.InferenceSession) return mod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((mod as any).default?.InferenceSession) return (mod as any).default;
  return mod;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBiRefNetSession(): Promise<any> {
  if (cachedBiRefNetSession) return cachedBiRefNetSession;

  const modelPath = path.join(process.cwd(), "models", "birefnet.onnx");
  if (!fs.existsSync(modelPath)) {
    throw new Error(`BiRefNet model not found at ${modelPath}`);
  }

  const ort = await getOrt();
  cachedBiRefNetSession = await ort.InferenceSession.create(modelPath, {
    executionProviders: ["cpu"],
    graphOptimizationLevel: "all",
  });

  return cachedBiRefNetSession;
}

export interface BiRefNetResult {
  pngBuffer: Buffer;
  inferenceTimeMs: number;
  width: number;
  height: number;
}

/**
 * Executes BiRefNet bilateral reference segmentation on an input image buffer.
 * Returns transparent PNG buffer with high-resolution edge details.
 */
export async function removeBackgroundWithBiRefNet(
  inputBuffer: Buffer
): Promise<BiRefNetResult> {
  const t0 = Date.now();
  const session = await getBiRefNetSession();
  const ort = await getOrt();

  // 1. Image metadata
  const original = sharp(inputBuffer);
  const metadata = await original.metadata();
  const origW = metadata.width || 800;
  const origH = metadata.height || 600;

  // 2. Resize to 1024x1024 expected by BiRefNet ONNX
  const targetSize = 1024;
  const { data: rawRgb } = await sharp(inputBuffer)
    .resize(targetSize, targetSize, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 3. Construct NCHW tensor with ImageNet normalization
  const planeSize = targetSize * targetSize;
  const floatData = new Float32Array(3 * planeSize);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];

  for (let i = 0; i < planeSize; i++) {
    const r = rawRgb[i * 3] / 255.0;
    const g = rawRgb[i * 3 + 1] / 255.0;
    const b = rawRgb[i * 3 + 2] / 255.0;

    floatData[i] = (r - mean[0]) / std[0];
    floatData[planeSize + i] = (g - mean[1]) / std[1];
    floatData[2 * planeSize + i] = (b - mean[2]) / std[2];
  }

  const inputTensor = new ort.Tensor("float32", floatData, [1, 3, targetSize, targetSize]);

  // 4. Run inference
  const results = await session.run({ input_image: inputTensor });
  const logits = results.output_image.data as Float32Array;

  // 5. Apply sigmoid activation to logits -> 8-bit grayscale matte
  const matteBuffer = Buffer.alloc(planeSize);
  for (let i = 0; i < planeSize; i++) {
    const logit = logits[i];
    const sig = 1 / (1 + Math.exp(-logit));
    matteBuffer[i] = Math.round(sig * 255);
  }

  // 6. Upsample matte to original dimensions with lanczos3
  const { data: fullMatte } = await sharp(matteBuffer, {
    raw: { width: targetSize, height: targetSize, channels: 1 },
  })
    .resize(origW, origH, { kernel: "lanczos3" })
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 7. Composite original RGB + BiRefNet alpha channel
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
