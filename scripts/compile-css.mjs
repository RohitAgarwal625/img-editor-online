import postcss from 'postcss';
import tailwindPostcss from '@tailwindcss/postcss';
import fs from 'fs';
import path from 'path';

async function buildCss() {
  const inputPath = path.resolve('src/app/globals.css');
  const outputPath = path.resolve('public/compiled.css');
  
  const css = fs.readFileSync(inputPath, 'utf8');
  console.log('Compiling CSS via PostCSS...');
  
  const result = await postcss([tailwindPostcss]).process(css, {
    from: inputPath,
    to: outputPath,
  });

  // Ensure public directory exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  fs.writeFileSync(outputPath, result.css);
  console.log(`Success! Compiled ${result.css.length} bytes to ${outputPath}`);
}

buildCss().catch(err => {
  console.error('Build CSS failed:', err);
  process.exit(1);
});
