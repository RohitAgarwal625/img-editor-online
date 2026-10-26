import fs from 'fs';
import sharp from 'sharp';
import ort from 'onnxruntime-node';

export async function runModnet(imagePath, outputPath, refSize = 512) {
  console.log(`[MODNet] Loading session for ${imagePath}...`);
  const session = await ort.InferenceSession.create('models/modnet.onnx');

  // 1. Get original image metadata
  const original = sharp(imagePath);
  const metadata = await original.metadata();
  const origW = metadata.width;
  const origH = metadata.height;

  // 2. Compute target dimensions (must be multiples of 32)
  let targetW, targetH;
  if (origW >= origH) {
    targetH = refSize;
    targetW = Math.round((origW / origH) * refSize);
  } else {
    targetW = refSize;
    targetH = Math.round((origH / origW) * refSize);
  }
  targetW = targetW - (targetW % 32);
  targetH = targetH - (targetH % 32);

  console.log(`[MODNet] Original: ${origW}x${origH} -> Resized for inference: ${targetW}x${targetH}`);

  // 3. Resize and get raw RGB pixels
  const { data: rawRgb } = await sharp(imagePath)
    .resize(targetW, targetH, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 4. Convert HWC RGB to NCHW [1, 3, H, W] normalized to [-1, 1]
  const planeSize = targetH * targetW;
  const floatData = new Float32Array(3 * planeSize);

  for (let i = 0; i < planeSize; i++) {
    const r = rawRgb[i * 3];
    const g = rawRgb[i * 3 + 1];
    const b = rawRgb[i * 3 + 2];

    // MODNet normalization: (pixel / 255.0 - 0.5) / 0.5
    floatData[i] = (r / 127.5) - 1.0;                  // R channel
    floatData[planeSize + i] = (g / 127.5) - 1.0;      // G channel
    floatData[2 * planeSize + i] = (b / 127.5) - 1.0;  // B channel
  }

  const inputTensor = new ort.Tensor('float32', floatData, [1, 3, targetH, targetW]);

  // 5. Run inference
  console.log('[MODNet] Running neural inference...');
  const t0 = Date.now();
  const results = await session.run({ input: inputTensor });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`[MODNet] Inference complete in ${elapsed}s!`);

  const matteData = results.output.data; // Float32Array of size [1, 1, targetH, targetW]

  let minVal = Infinity, maxVal = -Infinity;
  for (let i = 0; i < planeSize; i++) {
    if (matteData[i] < minVal) minVal = matteData[i];
    if (matteData[i] > maxVal) maxVal = matteData[i];
  }
  console.log(`[MODNet] Matte min: ${minVal.toFixed(3)}, max: ${maxVal.toFixed(3)}`);

  // 6. Convert matte float (0.0 to 1.0) to 8-bit grayscale buffer
  const matteBuffer = Buffer.alloc(planeSize);
  for (let i = 0; i < planeSize; i++) {
    const val = Math.max(0, Math.min(1, matteData[i]));
    matteBuffer[i] = Math.round(val * 255);
  }

  // 7. Upsample matte to original image dimensions with 1-channel grayscale
  const { data: fullMatte } = await sharp(matteBuffer, {
    raw: { width: targetW, height: targetH, channels: 1 },
  })
    .resize(origW, origH, { kernel: 'lanczos3' })
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`[MODNet] Full matte size: ${fullMatte.length} (expected: ${origW * origH})`);

  // 8. Composite original RGB with MODNet alpha matte
  const { data: origRgb } = await sharp(imagePath)
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

  await sharp(rgbaBuffer, {
    raw: { width: origW, height: origH, channels: 4 },
  })
    .png({ compressionLevel: 8 })
    .toFile(outputPath);

  console.log(`✓ [MODNet] Saved cutout to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

async function main() {
  await runModnet('public/samples/sample-woman.jpg', 'public/samples/sample-woman-modnet.png', 512);
  await runModnet('public/samples/sample-person.jpg', 'public/samples/sample-person-modnet.png', 512);
}

main().catch(console.error);
