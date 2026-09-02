const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', '..', 'Products', "Women's Unstitched", 'Shirt');
const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());
folders.sort((a, b) => (parseInt(a.replace(/\D/g, '')) || 0) - (parseInt(b.replace(/\D/g, '')) || 0));

const products = [];

for (const folder of folders) {
  const folderPath = path.join(baseDir, folder);
  const files = fs.readdirSync(folderPath);
  const sample = files[0];

  const skuMatch = sample.match(/(MZ[A-Za-z0-9]+)/i);
  const sku = skuMatch ? skuMatch[1] : '';
  let name = skuMatch ? sample.substring(0, skuMatch.index).trim() : sample;
  name = name.replace(/^[\s\-_]+|[\s\-_]+$/g, '');

  const afterSku = sample.substring(skuMatch ? (skuMatch.index + sku.length) : 0);
  
  let price = 1000;
  // Match 'Price 1000', 'price 1200', ' 1000-media'
  const priceMatch = afterSku.match(/(?:price\s*)?(\d{3,5})/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1], 10);
  } else if (afterSku.includes('Price 43')) {
    // Check if this was product 43 with Dhaga shirt which is 2200
    price = 2200;
  }

  products.push({
    folder,
    sku,
    name,
    price,
    fileCount: files.length,
    files
  });
}

console.log(`Parsed ${products.length} products:`);
products.forEach((p, idx) => {
  console.log(`${(idx + 1).toString().padStart(2, ' ')}. [${p.folder}] SKU: ${p.sku} | Price: Rs. ${p.price} | Files: ${p.fileCount} | Name: "${p.name}"`);
});

fs.writeFileSync(path.join(__dirname, 'parsed_products.json'), JSON.stringify(products, null, 2));
