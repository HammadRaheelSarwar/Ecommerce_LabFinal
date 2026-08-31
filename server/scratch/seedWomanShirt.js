const mongoose = require('mongoose');

async function insertWomanShirt() {
  await mongoose.connect('mongodb://127.0.0.1:27017/all_available');
  const Category = require('../models/Category');
  const Product = require('../models/Product');

  // Find Women's Unstitched and Women's Stitched categories
  const categories = await Category.find({
    $or: [
      { slug: 'womens-unstitched' },
      { slug: 'women-s-unstitched' },
      { slug: 'womens-stitched' },
      { slug: 'women-s-stitched' },
    ]
  });

  console.log(`Found ${categories.length} categories to attach`);

  for (const cat of categories) {
    const slugSuffix = cat.slug.includes('stitched') && !cat.slug.includes('unstitched') ? '-stitched' : '';
    const productData = {
      name: 'Pink Floral After Wash Soft Arganza Net Gown',
      slug: `pink-floral-after-wash-soft-arganza-net-gown${slugSuffix}`,
      sku: 'MZ779014450ANMCL',
      description: 'Exquisite Pink Floral After Wash Soft Organza Net Gown. Tailored with premium imported net organza featuring delicate floral embroidery, soft inner lining, and elegant bell sleeves. Ideal for festive gatherings and luxury formal wear.',
      shortDescription: 'Pink Floral Soft Organza Net Gown with delicate embroidery.',
      category: cat._id,
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
        { url: '/images/products/pink-floral-organza-gown-1.webp', isMain: true },
        { url: '/images/products/pink-floral-organza-gown-2.webp', isHover: true }
      ],
      variants: [
        { size: 'Small', color: 'Pink', stock: 12, lowStockAlert: 2 },
        { size: 'Medium', color: 'Pink', stock: 15, lowStockAlert: 3 },
        { size: 'Large', color: 'Pink', stock: 10, lowStockAlert: 2 }
      ]
    };

    const doc = await Product.findOneAndUpdate(
      { sku: 'MZ779014450ANMCL', category: cat._id },
      productData,
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded '${doc.name}' (SKU: ${doc.sku}, ID: ${doc._id}) in '${cat.name}' -> Subcategory: Shirt`);
  }

  process.exit(0);
}

insertWomanShirt().catch(err => {
  console.error('Error inserting product:', err);
  process.exit(1);
});
