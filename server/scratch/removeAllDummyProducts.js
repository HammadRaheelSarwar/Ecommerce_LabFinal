const mongoose = require('mongoose');

async function removeDummyProducts() {
  await mongoose.connect('mongodb://127.0.0.1:27017/all_available');
  const Product = require('../models/Product');

  // Delete all products where SKU is NOT the real SKU and name doesn't contain 'Pink Floral'
  const result = await Product.deleteMany({
    sku: { $ne: 'MZ779014450ANMCL' },
    name: { $not: /Pink Floral/i }
  });

  console.log(`✅ Removed ${result.deletedCount} dummy products from database.`);

  const remaining = await Product.find({}, 'name sku subcategory');
  console.log(`Remaining real products (${remaining.length}):`);
  remaining.forEach(p => console.log(` - ${p.name} | SKU: ${p.sku} | Subcategory: ${p.subcategory}`));

  process.exit(0);
}

removeDummyProducts().catch(err => {
  console.error('Error removing dummy products:', err);
  process.exit(1);
});
