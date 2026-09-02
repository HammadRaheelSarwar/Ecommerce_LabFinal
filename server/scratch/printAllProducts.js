const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'parsed_products.json')));
list.forEach((p, i) => {
  console.log(`[${i+1}] ${p.folder}`);
  console.log(`     Name: "${p.name}"`);
  console.log(`     SKU:  "${p.sku}"`);
  console.log(`     Price: ${p.price}`);
  console.log(`     Files (${p.files.length}):`);
  p.files.forEach(f => console.log(`       - ${f}`));
});
