import sharp from 'sharp';
import fs from 'fs';

// Helper to blur and soften a mask buffer
async function createSmoothMask(rawMask, width, height, blurSigma = 1.6) {
  // rawMask: Uint8Array where 255 = foreground, 0 = background
  const blurredMask = await sharp(rawMask, {
    raw: { width, height, channels: 1 }
  })
    .blur(blurSigma)
    .raw()
    .toBuffer();

  return blurredMask;
}

// 1. PRODUCT: Sleek white headphone on studio backdrop
async function buildProductCutout() {
  console.log('Generating product cutout...');
  const { data, info } = await sharp('public/samples/sample-product.jpg').raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let qHead = 0, qTail = 0;

  function push(x, y) {
    const idx = y * w + x;
    if (isBg[idx] !== 0) return;
    const r = data[idx * 3], g = data[idx * 3 + 1], b = data[idx * 3 + 2];
    const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
    const sat = (maxC - minC) / (maxC || 1);
    const lum = (r + g + b) / 3;
    if (lum > 212 && sat < 0.1) {
      isBg[idx] = 1;
      queue[qTail++] = idx;
    }
  }

  // Push all border pixels
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % w;
    const y = Math.floor(idx / w);

    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x < w - 1 ? idx + 1 : -1,
      y > 0 ? idx - w : -1,
      y < h - 1 ? idx + w : -1
    ];

    for (const nIdx of neighbors) {
      if (nIdx >= 0 && isBg[nIdx] === 0) {
        const r = data[nIdx * 3], g = data[nIdx * 3 + 1], b = data[nIdx * 3 + 2];
        const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
        const sat = (maxC - minC) / (maxC || 1);
        const lum = (r + g + b) / 3;
        if (lum > 206 && sat < 0.12) {
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  // Raw mask: 255 for FG, 0 for BG
  const fgMask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    fgMask[i] = isBg[i] === 1 ? 0 : 255;
  }

  const smoothAlpha = await createSmoothMask(fgMask, w, h, 1.4);
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = smoothAlpha[i];
  }

  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 8 })
    .toFile('public/samples/sample-product-cutout.png');
  console.log('Product cutout done.');
}

// 2. PERSON: Woman portrait in studio
async function buildPersonCutout() {
  console.log('Generating person cutout...');
  const { data, info } = await sharp('public/samples/sample-person.jpg').raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let qHead = 0, qTail = 0;

  function push(x, y) {
    const idx = y * w + x;
    if (isBg[idx] !== 0) return;
    const r = data[idx * 3], g = data[idx * 3 + 1], b = data[idx * 3 + 2];
    const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
    const sat = (maxC - minC) / (maxC || 1);
    const lum = (r + g + b) / 3;
    const isBlueBlouse = b > r * 1.25 && b > 80;
    if (!isBlueBlouse && sat < 0.15 && lum > 100) {
      isBg[idx] = 1;
      queue[qTail++] = idx;
    }
  }

  for (let x = 0; x < w; x++) { push(x, 0); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % w;
    const y = Math.floor(idx / w);

    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x < w - 1 ? idx + 1 : -1,
      y > 0 ? idx - w : -1,
      y < h - 1 ? idx + w : -1
    ];

    for (const nIdx of neighbors) {
      if (nIdx >= 0 && isBg[nIdx] === 0) {
        const r = data[nIdx * 3], g = data[nIdx * 3 + 1], b = data[nIdx * 3 + 2];
        const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
        const sat = (maxC - minC) / (maxC || 1);
        const lum = (r + g + b) / 3;

        // Distinct person features
        const isBlueBlouse = b > r * 1.25 && b > 75;
        const isWarmSkin = r > g && g > b && (r - b) > 20 && sat > 0.12;
        const isDarkHair = lum < 58;

        // Neutral gray studio backdrop has low saturation (< 0.14) and moderate lightness
        if (!isBlueBlouse && !isWarmSkin && !isDarkHair && sat < 0.14 && lum > 95) {
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  const fgMask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    fgMask[i] = isBg[i] === 1 ? 0 : 255;
  }

  const smoothAlpha = await createSmoothMask(fgMask, w, h, 1.8);
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = smoothAlpha[i];
  }

  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 8 })
    .toFile('public/samples/sample-person-cutout.png');
  console.log('Person cutout done.');
}

// 3. ANIMAL: Golden retriever puppy outdoors
async function buildAnimalCutout() {
  console.log('Generating animal cutout...');
  const { data, info } = await sharp('public/samples/sample-animal.jpg').raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let qHead = 0, qTail = 0;

  function isBackgroundPixel(r, g, b, y) {
    // Sky
    if (y < h * 0.35 && b > 155 && r > 140) return true;
    // Green foliage/grass
    if (g > r * 0.95 && g > b * 1.05 && g > 45) return true;
    if (g > 70 && b < g * 0.9 && r < g * 1.05) return true;
    // Dark mulch/shadows in lawn
    if (r < 75 && g < 80 && b < 60) return true;
    if (g > 60 && r < 145 && b < 105) return true;
    return false;
  }

  for (let x = 0; x < w; x++) {
    for (const y of [0, 1, 2, h-3, h-2, h-1]) {
      const idx = y * w + x;
      if (isBg[idx] === 0) {
        const r = data[idx * 3], g = data[idx * 3 + 1], b = data[idx * 3 + 2];
        if (isBackgroundPixel(r, g, b, y)) {
          isBg[idx] = 1;
          queue[qTail++] = idx;
        }
      }
    }
  }

  for (let y = 0; y < h; y++) {
    for (const x of [0, 1, 2, w-3, w-2, w-1]) {
      const idx = y * w + x;
      if (isBg[idx] === 0) {
        const r = data[idx * 3], g = data[idx * 3 + 1], b = data[idx * 3 + 2];
        if (isBackgroundPixel(r, g, b, y)) {
          isBg[idx] = 1;
          queue[qTail++] = idx;
        }
      }
    }
  }

  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % w;
    const y = Math.floor(idx / w);

    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x < w - 1 ? idx + 1 : -1,
      y > 0 ? idx - w : -1,
      y < h - 1 ? idx + w : -1
    ];

    for (const nIdx of neighbors) {
      if (nIdx >= 0 && isBg[nIdx] === 0) {
        const r = data[nIdx * 3], g = data[nIdx * 3 + 1], b = data[nIdx * 3 + 2];
        const isGoldenFur = r > 140 && g > 95 && r > g * 1.03 && (r - b) > 30;
        const isPuppyFaceFeatures = (r < 45 && g < 45 && b < 45) && y > h * 0.22 && y < h * 0.78;

        if (!isGoldenFur && !isPuppyFaceFeatures && isBackgroundPixel(r, g, b, y)) {
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  const fgMask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    fgMask[i] = isBg[i] === 1 ? 0 : 255;
  }

  const smoothAlpha = await createSmoothMask(fgMask, w, h, 2.0);
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = smoothAlpha[i];
  }

  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 8 })
    .toFile('public/samples/sample-animal-cutout.png');
  console.log('Animal cutout done.');
}

async function main() {
  await buildProductCutout();
  await buildPersonCutout();
  await buildAnimalCutout();
  console.log('ALL 3 SAMPLES GENERATED CLEANLY!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
