const mongoose = require('mongoose');

async function fixSingleProduct() {
  await mongoose.connect('mongodb://127.0.0.1:27017/all_available');
  const Product = require('../models/Product');
  const Category = require('../models/Category');

  // Find Women's Unstitched category
  const unstitchedCat = await Category.findOne({ slug: 'women-s-unstitched' });
  if (!unstitchedCat) {
    console.error('Women\'s unstitched category not found');
    process.exit(1);
  }

  // Delete any duplicate products
  await Product.deleteMany({
    $or: [
      { slug: /stitched$/ },
      { sku: { $ne: 'MZ779014450ANMCL' } }
    ]
  });

  // Ensure exactly ONE product exists with the two images in exact order: 1 Pink first, 2 Pink second
  await Product.findOneAndUpdate(
    { sku: 'MZ779014450ANMCL' },
    {
      name: 'Pink Floral After Wash Soft Arganza Net Gown',
      slug: 'pink-floral-after-wash-soft-arganza-net-gown',
      sku: 'MZ779014450ANMCL',
      description: 'Exquisite Pink Floral After Wash Soft Organza Net Gown. Tailored with premium imported net organza featuring delicate floral embroidery, soft inner lining, and elegant bell sleeves. Ideal for festive gatherings and luxury formal wear.',
      shortDescription: 'Pink Floral Soft Organza Net Gown with delicate embroidery.',
      category: unstitchedCat._id,
      subcategory: 'Shirt',
      brand: 'All Available Exclusive',
      gender: 'women',
      material: 'Soft Organza Net',
      tags: ['Woman Shirt', 'Shirt', 'Organza', 'Floral Gown', 'Festive', 'Pink'],
      basePrice: 4500,
      salePrice: 3450,
      discountPercentage: 23,
      rating: 4.9,
      reviewCount: 28,
      soldCount: 84,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isActive: true,
      allowWhatsApp: true,
      allowEmail: true,
      images: [
        {
          url: '/images/products/pink-floral-organza-gown-1.webp',
          isMain: true,
          isHover: false,
          sortOrder: 1
        },
        {
          url: '/images/products/pink-floral-organza-gown-2.webp',
          isMain: false,
          isHover: true,
          sortOrder: 2
        }
      ],
      variants: [
        { size: 'Small', color: 'Pink', stock: 12, lowStockAlert: 2 },
        { size: 'Medium', color: 'Pink', stock: 15, lowStockAlert: 3 },
        { size: 'Large', color: 'Pink', stock: 10, lowStockAlert: 2 }
      ]
    },
    { upsert: true, new: true }
  );

  const all = await Product.find({});
  console.log(`✅ Success! Total products in store: ${all.length}`);
  all.forEach(p => {
    console.log(`- ${p.name} | SKU: ${p.sku} | Images: ${p.images.length}`);
    p.images.forEach((img, idx) => console.log(`   Image ${idx + 1}: ${img.url}`));
  });

  process.exit(0);
}

fixSingleProduct().catch(err => {
  console.error(err);
  process.exit(1);
});
