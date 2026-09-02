const fs = require('fs');
const path = require('path');

const srcBase = path.join(__dirname, '..', '..', 'Products', "Women's Unstitched", 'Shirt');
const destPublic = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'products', 'unstitched-shirt');
const destDist = path.join(__dirname, '..', '..', 'client', 'dist', 'images', 'products', 'unstitched-shirt');

[destPublic, destDist].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const folders = fs.readdirSync(srcBase).filter(f => fs.statSync(path.join(srcBase, f)).isDirectory());
folders.sort((a, b) => (parseInt(a.replace(/\D/g, '')) || 0) - (parseInt(b.replace(/\D/g, '')) || 0));

let copiedCount = 0;
const imageMap = {};

for (const folder of folders) {
  const folderNum = parseInt(folder.replace(/\D/g, ''), 10) || 0;
  const folderPath = path.join(srcBase, folder);
  const files = fs.readdirSync(folderPath);

  imageMap[folder] = [];

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase() || '.webp';
    const cleanFileName = `product-${folderNum}-${index + 1}${ext}`;
    const srcFile = path.join(folderPath, file);
    
    // Copy to client/public
    const destPublicFile = path.join(destPublic, cleanFileName);
    fs.copyFileSync(srcFile, destPublicFile);

    // Copy to client/dist if dist exists
    if (fs.existsSync(path.join(__dirname, '..', '..', 'client', 'dist'))) {
      const destDistFile = path.join(destDist, cleanFileName);
      fs.copyFileSync(srcFile, destDistFile);
    }

    const publicUrl = `/images/products/unstitched-shirt/${cleanFileName}`;
    imageMap[folder].push({
      fileName: cleanFileName,
      url: publicUrl,
      isMain: index === 0,
      isHover: index === 1,
      sortOrder: index + 1
    });

    copiedCount++;
  });
}

console.log(`✅ Successfully copied ${copiedCount} images across ${folders.length} products to public/images/products/unstitched-shirt/`);
fs.writeFileSync(path.join(__dirname, 'image_map.json'), JSON.stringify(imageMap, null, 2));
