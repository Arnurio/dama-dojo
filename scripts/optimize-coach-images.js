// Optimize coach portrait images: resize to 512px, convert to WebP, keep PNG fallback
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const COACHES_DIR = path.join(__dirname, "..", "public", "coaches");
const names = ["arman", "erzat", "nurdaulet", "arlan", "timur"];

(async () => {
  for (const name of names) {
    const src = path.join(COACHES_DIR, `${name}.png`);
    if (!fs.existsSync(src)) {
      console.log(`⚠️  Missing: ${src}`);
      continue;
    }

    const sizeBefore = fs.statSync(src).size;

    // Compressed PNG (replace original)
    const optimizedBuf = await sharp(src)
      .resize(512, 512, { fit: "cover", position: "top" })
      .png({ quality: 85, compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(src, optimizedBuf);

    // WebP version (smaller, used by next/image if supported)
    const webpPath = path.join(COACHES_DIR, `${name}.webp`);
    await sharp(optimizedBuf).webp({ quality: 88 }).toFile(webpPath);

    const sizeAfter = fs.statSync(src).size;
    const sizeWebp = fs.statSync(webpPath).size;
    console.log(`✓ ${name}: ${(sizeBefore/1024).toFixed(0)}KB → PNG ${(sizeAfter/1024).toFixed(0)}KB, WebP ${(sizeWebp/1024).toFixed(0)}KB`);
  }
  console.log("\nDone! Images optimized.");
})();
