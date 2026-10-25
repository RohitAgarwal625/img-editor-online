import sharp from 'sharp';

async function main() {
  const { data: orig, info } = await sharp('public/samples/sample-car.jpg').raw().toBuffer({ resolveWithObject: true });
  const { data: cut } = await sharp('public/samples/sample-car-cutout.png').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 1. Find the lowest car pixel in each column
  const carBottomY = new Int32Array(w);
  for (let x = 0; x < w; x++) {
    let lowest = -1;
    for (let y = h - 1; y >= 0; y--) {
      const idx = (y * w + x) * 4;
      if (cut[idx + 3] > 80) {
        lowest = y;
        break;
      }
    }
    carBottomY[x] = lowest;
  }

  // 2. Create ground shadow mask
  const shadowMask = Buffer.alloc(w * h);
  const ROAD_LUM = 135;
  const DEEP_SHADOW_LUM = 18;

  let shadowPixelCount = 0;

  // Ground shadow spans under the vehicle from splitter (x: 260) to behind rear tire (x: 940)
  for (let x = 260; x <= 940; x++) {
    let bottom = carBottomY[x];
    if (bottom === -1) {
      if (x > 910 && x <= 940) {
        bottom = 675; // Anchor to rear wheel contact line for shadow spill
      } else {
        continue;
      }
    }

    // Shadow extends downwards from car underside
    const maxDrop = x > 800 ? 80 : 75;
    for (let y = Math.max(0, bottom - 5); y < Math.min(h, bottom + maxDrop); y++) {
      const idx = y * w + x;
      const cIdx = idx * 4;

      // Never place shadow over opaque car body
      if (cut[cIdx + 3] > 180) continue;

      const oIdx = idx * 3;
      const r = orig[oIdx];
      const g = orig[oIdx + 1];
      const b = orig[oIdx + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;

      if (lum < ROAD_LUM) {
        // Darkness intensity: 0 (sunlit road) to 1 (contact core)
        const darkness = Math.max(0, Math.min(1, (ROAD_LUM - lum) / (ROAD_LUM - DEEP_SHADOW_LUM)));

        // Vertical distance falloff
        const distY = Math.max(0, y - bottom);
        const distFactor = Math.max(0, 1 - Math.pow(distY / maxDrop, 1.35));

        // Horizontal feathering at left/right fringes
        let hFactor = 1.0;
        if (x < 310) hFactor = Math.max(0, (x - 260) / 50);
        if (x > 905) hFactor = Math.max(0, 1 - (x - 905) / 35);

        // Alpha calculation: max ~210 (~82% opacity directly under tires)
        const alpha = Math.round(Math.pow(darkness, 1.1) * distFactor * hFactor * 210);
        if (alpha > 5) {
          shadowMask[idx] = Math.max(shadowMask[idx], alpha);
          shadowPixelCount++;
        }
      }
    }
  }

  console.log(`Detected ${shadowPixelCount} raw shadow pixels from photo.`);

  // 3. Smooth the shadow mask to remove asphalt pebble texture and create silky penumbra
  const smoothedShadow = await sharp(shadowMask, {
    raw: { width: w, height: h, channels: 1 },
  })
    .toColourspace('b-w')
    .blur(3.2)
    .raw()
    .toBuffer();

  // 4. Composite: Car body strictly on top, shadow on bottom
  const finalRgba = Buffer.alloc(w * h * 4);
  let finalShadowCount = 0;

  for (let i = 0; i < w * h; i++) {
    const cIdx = i * 4;
    const carA = cut[cIdx + 3];
    const sA = smoothedShadow[i];

    if (carA > 0) {
      // Preserve car pixel exactly
      finalRgba[cIdx] = cut[cIdx];
      finalRgba[cIdx + 1] = cut[cIdx + 1];
      finalRgba[cIdx + 2] = cut[cIdx + 2];
      finalRgba[cIdx + 3] = carA;
    } else if (sA > 6) {
      // Ground shadow: deep neutral charcoal
      finalRgba[cIdx] = 16;
      finalRgba[cIdx + 1] = 18;
      finalRgba[cIdx + 2] = 22;
      finalRgba[cIdx + 3] = sA;
      finalShadowCount++;
    } else {
      finalRgba[cIdx] = 0;
      finalRgba[cIdx + 1] = 0;
      finalRgba[cIdx + 2] = 0;
      finalRgba[cIdx + 3] = 0;
    }
  }

  console.log(`Composite generated with ${finalShadowCount} smooth ground shadow pixels.`);

  await sharp(finalRgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 8 })
    .toFile('public/samples/sample-car-cutout.png');

  console.log('✓ Successfully saved public/samples/sample-car-cutout.png with realistic ground contact shadow!');
}

main().catch(console.error);
