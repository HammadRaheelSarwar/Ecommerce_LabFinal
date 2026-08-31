require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const supabase = require('../config/supabase');

async function seedSupabase() {
  console.log('🚀 Starting Supabase Database Seeding (Real Products Only)...');

  if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env.');
    process.exit(1);
  }

  try {
    // 1. Seed Website Settings
    console.log('📦 Seeding Website Settings...');
    await supabase.from('website_settings').upsert({
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

    // 2. Seed Categories from categoriesData.js
    const catFilePath = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'categoriesData.js');
    const content = fs.readFileSync(catFilePath, 'utf8');
    const arrayMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!arrayMatch) throw new Error('Could not find CATEGORIES_DATA in categoriesData.js');
    const categoriesData = JSON.parse(arrayMatch[0]);

    console.log(`📦 Seeding ${categoriesData.length} Categories...`);

    let womanCatId = null;

    for (const cat of categoriesData) {
      const catSlug = cat.slug || slugify(cat.name, { lower: true, strict: true });

      const subcategories = (cat.subcategories || []).map((sub, i) => ({
        name: sub.name,
        slug: sub.slug || slugify(sub.name, { lower: true, strict: true }),
        image: { url: sub.img || cat.icon || '' },
        sortOrder: i,
        isActive: true,
      }));

      const { data: catDoc } = await supabase
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

      if (catSlug === 'women-s-unstitched' && catDoc) {
        womanCatId = catDoc.id;
      }
    }

    // 3. Seed verified real product Pink Floral Gown
    if (womanCatId) {
      console.log('📦 Seeding verified product Pink Floral Gown...');
      await supabase.from('products').upsert(
        {
          name: 'Pink Floral After Wash Soft Arganza Net Gown',
          slug: 'pink-floral-after-wash-soft-arganza-net-gown',
          sku: 'MZ779014450ANMCL',
          description: 'Exquisite Pink Floral After Wash Soft Organza Net Gown. Tailored with premium imported net organza featuring delicate floral embroidery, soft inner lining, and elegant bell sleeves. Ideal for festive gatherings and luxury formal wear.',
          short_description: 'Pink Floral Soft Organza Net Gown with delicate embroidery.',
          category_id: womanCatId,
          subcategory: 'Shirt',
          brand: 'All Available Exclusive',
          base_price: 4500,
          sale_price: 3450,
          discount_percentage: 23,
          rating: 4.9,
          review_count: 28,
          images: [
            { url: '/images/products/pink-floral-organza-gown-1.webp', isMain: true },
            { url: '/images/products/pink-floral-organza-gown-2.webp', isHover: true }
          ],
          variants: [
            { size: 'Small', color: 'Pink', stock: 12, lowStockAlert: 2 },
            { size: 'Medium', color: 'Pink', stock: 15, lowStockAlert: 3 },
            { size: 'Large', color: 'Pink', stock: 10, lowStockAlert: 2 }
          ],
          is_best_seller: true,
          is_featured: true,
          is_new_arrival: true,
          is_active: true,
          allow_whatsapp: true,
          allow_email: true,
        },
        { onConflict: 'slug' }
      );
    }

    console.log('🎉 Supabase Seeding Completed (Zero Dummy Products)!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
}

seedSupabase();
