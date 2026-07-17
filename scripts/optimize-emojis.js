import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emojisDir = path.resolve(__dirname, '../public/assets/emojis');

async function optimizeEmojis() {
  try {
    const files = await fs.readdir(emojisDir);
    let convertedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.png')) {
        const filePath = path.join(emojisDir, file);
        const webpPath = path.join(emojisDir, file.replace(/\.png$/, '.webp'));
        
        console.log(`Converting ${file} to WebP...`);
        
        await sharp(filePath)
          .webp({ quality: 80, lossless: false })
          .toFile(webpPath);
          
        await fs.unlink(filePath);
        convertedCount++;
      }
    }
    
    console.log(`\nOptimization complete! Converted ${convertedCount} PNG files to WebP.`);
  } catch (error) {
    console.error('Error optimizing emojis:', error);
  }
}

optimizeEmojis();
