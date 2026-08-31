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

      const catDoc = await Category.findOneAndUpdate(
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

      // Seed 2-4 products per subcategory or category
      const subList = cat.subcategories && cat.subcategories.length > 0
        ? cat.subcategories.slice(0, 4)
        : [{ name: cat.name, slug: catSlug, img: cat.icon }];

      for (const sub of subList) {
        const productTemplates = [
          { prefix: 'Embroidered', price: 1450, discount: 25 },
          { prefix: 'Digital Printed', price: 990, discount: 15 },
          { prefix: 'Luxury Festive', price: 2850, discount: 30 },
        ];

        for (let i = 0; i < productTemplates.length; i++) {
          const t = productTemplates[i];
          const prodName = `${t.prefix} ${sub.name}`;
          const prodSlug = `${slugify(prodName, { lower: true, strict: true })}-${catSlug.slice(0, 4)}-${i + 1}`;

          const salePrice = t.price;
          const basePrice = Math.round(salePrice / (1 - t.discount / 100));

          await Product.findOneAndUpdate(
            { slug: prodSlug },
            {
              name: prodName,
              slug: prodSlug,
              sku: `AA-${catSlug.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
              description: `Authentic premium ${prodName}. Crafted with high-grade materials and detailed finishing for everyday and festive elegance.`,
              shortDescription: `Premium ${sub.name} by All Available.`,
              category: catDoc._id,
              subcategory: sub.name,
              brand: 'All Available',
              basePrice,
              salePrice,
              discountPercentage: t.discount,
              rating: 4.8,
              reviewCount: 14 + (i * 7),
              images: [
                { url: sub.img || cat.icon || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80', isMain: true }
              ],
              variants: [
                { size: 'Standard', color: 'Multicolor', stock: 15, lowStockAlert: 3 },
                { size: 'Medium', color: 'Classic', stock: 10, lowStockAlert: 2 },
              ],
              isBestSeller: i === 0,
              isFeatured: i === 1,
              isNewArrival: i === 2,
              isActive: true,
              allowWhatsApp: true,
              allowEmail: true,
            },
            { upsert: true }
          );
        }
      }
    }

    const totalCategories = await Category.countDocuments();
    const totalProducts = await Product.countDocuments();
    console.log(`🎉 Successfully seeded Markaz categories: ${totalCategories} categories, ${totalProducts} products!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Markaz:', err);
    process.exit(1);
  }
}

seedMarkaz();
