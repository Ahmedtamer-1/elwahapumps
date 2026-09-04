import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images');

async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const webpPath = fullPath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');
        
        console.log(`Converting ${fullPath} to WebP...`);
        try {
          await sharp(fullPath)
            .webp({ quality: 75, effort: 4 }) 
            .toFile(webpPath);
          
          await fs.access(webpPath);
          await fs.unlink(fullPath);
        } catch (e) {
          console.error(`Error processing ${entry.name}:`, e);
        }
      }
    }
  }
}

async function main() {
  console.log('Starting image compression...');
  await processDirectory(PUBLIC_DIR);
  console.log('Finished image compression.');
}

main();
