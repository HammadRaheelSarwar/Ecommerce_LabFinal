const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', '..', 'Products', "Women's Unstitched", 'Shirt');

if (!fs.existsSync(baseDir)) {
  console.error("Directory not found:", baseDir);
  process.exit(1);
}

const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

folders.sort((a, b) => {
  const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
  const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
  return numA - numB;
});

console.log(`Found ${folders.length} product folders:`);

const allInfo = [];

for (const folder of folders) {
  const folderPath = path.join(baseDir, folder);
  const files = fs.readdirSync(folderPath);
  allInfo.push({ folder, files });
  console.log(`\nFolder: ${folder}`);
  files.forEach(f => console.log(`  - ${f}`));
}
