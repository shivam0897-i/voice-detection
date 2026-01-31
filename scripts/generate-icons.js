/**
 * Script to convert SVG icons to PNG for better compatibility
 * Run with: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

async function convertSvgToPng(inputFile, outputFile, size) {
  try {
    const svgBuffer = readFileSync(join(publicDir, inputFile));
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, outputFile));
    
    console.log(`✓ Generated ${outputFile} (${size}x${size})`);
  } catch (error) {
    console.error(`✗ Failed to generate ${outputFile}:`, error.message);
  }
}

async function main() {
  console.log('Generating PNG icons from SVGs...\n');
  
  // Generate PWA icons
  await convertSvgToPng('icon-192.svg', 'icon-192.png', 192);
  await convertSvgToPng('icon-512.svg', 'icon-512.png', 512);
  
  // Generate OG image (1200x630 aspect ratio)
  try {
    const svgBuffer = readFileSync(join(publicDir, 'og-image.svg'));
    
    await sharp(svgBuffer)
      .resize(1200, 630)
      .png()
      .toFile(join(publicDir, 'og-image.png'));
    
    console.log('✓ Generated og-image.png (1200x630)');
  } catch (error) {
    console.error('✗ Failed to generate og-image.png:', error.message);
  }
  
  console.log('\nDone! Update manifest.json and index.html to use PNG files.');
}

main();
