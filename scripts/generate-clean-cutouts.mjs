import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Loading @imgly/background-removal-node AI engine...');
  const { removeBackground } = await import('@imgly/background-removal-node');

  const samples = [
    { in: 'public/samples/sample-product.jpg', out: 'public/samples/sample-product-cutout.png', name: 'Products (Headphones)' },
    { in: 'public/samples/sample-person.jpg', out: 'public/samples/sample-person-cutout.png', name: 'People (Portrait)' },
    { in: 'public/samples/sample-animal.jpg', out: 'public/samples/sample-animal-cutout.png', name: 'Animals (Golden Retriever)' },
  ];

  for (const sample of samples) {
    console.log(`\n[AI Inference] Processing ${sample.name}...`);
    const startTime = Date.now();
    const blob = await removeBackground(sample.in, {
      progress: (key, current, total) => {
        if (key.includes('inference')) {
          console.log(`  ${key}: ${Math.round((current / (total || 1)) * 100)}%`);
        }
      },
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(sample.out, buffer);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✓ Saved ${sample.out} (${(buffer.length / 1024).toFixed(1)} KB) in ${elapsed}s`);
  }

  console.log('\nAll showcase samples processed with authentic neural network background removal!');
}

main().catch((err) => {
  console.error('Error generating cutouts:', err);
  process.exit(1);
});
