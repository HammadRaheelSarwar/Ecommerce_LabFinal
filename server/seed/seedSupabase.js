require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const supabase = require('../config/supabase');

async function seedSupabase() {
  console.log('🚀 Starting Supabase Database Seeding...');

  if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env.');
    process.exit(1);
  }

  try {
    // 1. Seed Website Settings
    console.log('📦 Seeding Website Settings...');
    const { error: settingsError } = await supabase.from('website_settings').upsert({
      id: 'primary',
      site_name: 'All Available',
      site_tagline: 'Everything You Desire, All Available.',
      announcement_bar: {
        isActive: true,
        messages: [
          'Free Delivery on Orders Above Rs. 5,000',
          'New Festive Collection Has Arrived',
          'Verified Domestic & Overseas Suppliers',
        ],
      },
      contact: {
        email: 'allavailable.shooping@gmail.com',
        phone: '+92 306 4538251',
        whatsapp: '+92 306 4538251',
        address: 'Gulberg III, Lahore, Pakistan',
      },
      ordering: {
        whatsappNumber: '+923064538251',
        orderEmail: 'allavailable.shooping@gmail.com',
        whatsappDefaultMessage: '',
        emailDefaultMessage: '',
      },
      social: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        whatsapp: '+923064538251',
      },
      shipping: {
        freeShippingThreshold: 5000,
        standardShippingCost: 200,
      },
      footer: {
        copyrightText: '© All Available. All Rights Reserved.',
      },
    });

    if (settingsError) {
      console.warn('Settings warning:', settingsError.message);
    } else {
      console.log('✅ Website settings seeded');
    }

    // 2. Seed Categories & Products from categoriesData.js
    const catFilePath = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'categoriesData.js');
    const content = fs.readFileSync(catFilePath, 'utf8');
    const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!arrayMatch) throw new Error('Could not find CATEGORIES_DATA in categoriesData.js');
    const categoriesData = JSON.parse(arrayMatch[0]);

    console.log(`📦 Seeding ${categoriesData.length} Categories & Products...`);

    let totalProductsSeeded = 0;

    for (const cat of categoriesData) {
      const catSlug = cat.slug || slugify(cat.name, { lower: true, strict: true });

      const subcategories = (cat.subcategories || []).map((sub, i) => ({
        name: sub.name,
        slug: sub.slug || slugify(sub.name, { lower: true, strict: true }),
        image: { url: sub.img || cat.icon || '' },
        sortOrder: i,
        isActive: true,
      }));

      const { data: catDoc, error: catError } = await supabase
        .from('categories')
        .upsert(
          {
            name: cat.name,
            slug: catSlug,
            image_url: cat.icon || '',
            subcategories,
            is_active: true,
            show_in_nav: true,
          },
          { onConflict: 'slug' }
        )
        .select()
        .single();

      if (catError) {
        console.error(`Error upserting category ${cat.name}:`, catError.message);
        continue;
      }

      const categoryId = catDoc.id;

      // Seed sample products for subcategories
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

          const { error: prodError } = await supabase.from('products').upsert(
            {
              name: prodName,
              slug: prodSlug,
              sku: `AA-${catSlug.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
              description: `Authentic premium ${prodName}. Crafted with high-grade materials and detailed finishing for everyday and festive elegance.`,
              short_description: `Premium ${sub.name} by All Available.`,
              category_id: categoryId,
              subcategory: sub.name,
              brand: 'All Available',
              base_price: basePrice,
              sale_price: salePrice,
              discount_percentage: t.discount,
              rating: 4.8,
              review_count: 14 + (i * 7),
              images: [
                { url: sub.img || cat.icon || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80', isMain: true }
              ],
              variants: [
                { size: 'Standard', color: 'Multicolor', stock: 15, lowStockAlert: 3 },
                { size: 'Medium', color: 'Classic', stock: 10, lowStockAlert: 2 },
              ],
              is_best_seller: i === 0,
              is_featured: i === 1,
              is_new_arrival: i === 2,
              is_active: true,
              allow_whatsapp: true,
              allow_email: true,
            },
            { onConflict: 'slug' }
          );

          if (!prodError) totalProductsSeeded++;
        }
      }
    }

    console.log(`✅ Seeded ${categoriesData.length} categories and ${totalProductsSeeded} products into Supabase!`);
    console.log('🎉 Supabase Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
}

seedSupabase();
