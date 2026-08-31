const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const Category = require('../models/Category');
const Product = require('../models/Product');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/all_available');
  console.log('✅ MongoDB connected for Markaz seeding');
};

async function seedMarkaz() {
  try {
    await connectDB();

    // Read client/src/data/categoriesData.js
    const catFilePath = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'categoriesData.js');
    const content = fs.readFileSync(catFilePath, 'utf8');
    const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!arrayMatch) throw new Error('Could not find CATEGORIES_DATA array in file');
    const categoriesData = JSON.parse(arrayMatch[0]);

    console.log(`Loaded ${categoriesData.length} categories from categoriesData.js`);

    for (const cat of categoriesData) {
      const catSlug = cat.slug || slugify(cat.name, { lower: true, strict: true });
      
      const subcategories = (cat.subcategories || []).map((sub, i) => ({
        name: sub.name,
        slug: sub.slug || slugify(sub.name, { lower: true, strict: true }),
        image: { url: sub.img || cat.icon || '' },
        sortOrder: i,
        isActive: true,
      }));

      await Category.findOneAndUpdate(
        { slug: catSlug },
        {
          name: cat.name,
          slug: catSlug,
          image: { url: cat.icon || '' },
          subcategories,
          isActive: true,
          showInNav: true,
        },
        { upsert: true, new: true }
      );
    }

    console.log('✅ All categories seeded without dummy products.');

    // Ensure the real Woman Shirt product is seeded
    const womanCat = await Category.findOne({ slug: 'women-s-unstitched' });
    if (womanCat) {
      await Product.findOneAndUpdate(
        { sku: 'MZ779014450ANMCL' },
        {
          name: 'Pink Floral After Wash Soft Arganza Net Gown',
          slug: 'pink-floral-after-wash-soft-arganza-net-gown',
          sku: 'MZ779014450ANMCL',
          description: 'Exquisite Pink Floral After Wash Soft Organza Net Gown. Tailored with premium imported net organza featuring delicate floral embroidery, soft inner lining, and elegant bell sleeves. Ideal for festive gatherings and luxury formal wear.',
          shortDescription: 'Pink Floral Soft Organza Net Gown with delicate embroidery.',
          category: womanCat._id,
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
        },
        { upsert: true, new: true }
      );
      console.log('✅ Real product Pink Floral Gown verified.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedMarkaz();
