const mongoose = require('mongoose');

async function clean() {
  await mongoose.connect('mongodb://127.0.0.1:27017/all_available');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const underSlugs = ['women-undergarments', 'men-s-undergarments', 'women-s-undergarments'];
  
  const cats = await Category.find({ slug: { $in: underSlugs } });
  const catIds = cats.map(c => c._id);
  
  const deletedProducts = await Product.deleteMany({
    $or: [
      { category: { $in: catIds } },
      { subcategory: { $in: ['Bras', 'Bra Sets', 'Panties', 'Lingerie', 'Camisoles', 'Undershirts', "Men's Underwear", "Women's Thermals", "Men's Thermals", "Undergarment Accessories"] } }
    ]
  });
  
  const deletedCats = await Category.deleteMany({ slug: { $in: underSlugs } });
  console.log(`✅ Successfully deleted ${deletedCats.deletedCount} undergarment categories and ${deletedProducts.deletedCount} products from DB.`);
  process.exit(0);
}

clean().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
