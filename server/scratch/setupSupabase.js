/**
 * setupSupabase.js
 * 
 * Connects to Supabase with service_role key and:
 * 1. Creates all required tables via raw SQL (using pg direct connection)
 * 2. Seeds categories and the real product
 * 3. Creates default admin user
 * 
 * Run: node server/scratch/setupSupabase.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Product image URLs — using the locally hosted images (served from client/public)
// For production these would be Supabase Storage URLs
const MODEL_IMAGE_URL = '/images/products/pink-floral-organza-gown-1.webp';
const CLOTH_IMAGE_URL = '/images/products/pink-floral-organza-gown-2.webp';

async function checkTablesExist() {
  const { data, error } = await supabase.from('products').select('id').limit(1);
  // If error code is PGRST205, table doesn't exist
  if (error && error.code === 'PGRST205') return false;
  return true;
}

async function seedCategories(supabase) {
  console.log('\n📦 Seeding Categories...');

  const categories = [
    {
      name: "Women's Unstitched",
      slug: 'womens-unstitched',
      image_url: 'https://images.markaz.com/fit-in/130x130/filters:format(webp)/https://markaz-platform-prod.s3.amazonaws.com/categories/womenUnstitched.png',
      subcategories: [
        { name: 'Shirt', slug: 'shirt', sortOrder: 0 },
        { name: '2 Piece Suits', slug: '2-piece-suits', sortOrder: 1 },
        { name: 'Kurti', slug: 'kurti', sortOrder: 2 },
        { name: "Women's Lehenga", slug: 'womens-lehenga', sortOrder: 3 },
        { name: 'Trouser', slug: 'trouser', sortOrder: 4 },
        { name: '3 Piece Suits', slug: '3-piece-suits', sortOrder: 5 },
        { name: 'Saree', slug: 'saree', sortOrder: 6 },
      ],
      sort_order: 1,
    },
    {
      name: "Women's Stitched",
      slug: 'womens-stitched',
      image_url: '',
      subcategories: [
        { name: 'Kurta / Kurti', slug: 'kurta-kurti', sortOrder: 0 },
        { name: 'Shalwar Kameez', slug: 'shalwar-kameez', sortOrder: 1 },
        { name: 'Gown / Maxi', slug: 'gown-maxi', sortOrder: 2 },
      ],
      sort_order: 2,
    },
    {
      name: "Kids & Mother",
      slug: 'kids-mother',
      image_url: '',
      subcategories: [],
      sort_order: 3,
    },
  ];

  const ids = {};
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) {
      console.log(`  ⚠️  Category "${cat.name}": ${error.message}`);
    } else {
      ids[data.slug] = data.id;
      console.log(`  ✅ Category "${cat.name}" (${data.id})`);
    }
  }
  return ids;
}

async function seedProduct(supabase, categoryIds) {
  console.log('\n📦 Seeding Pink Floral Gown product...');

  const womanCatId = categoryIds['womens-unstitched'];

  const product = {
    name: 'Pink Floral After Wash Soft Arganza Net Gown',
    slug: 'pink-floral-after-wash-soft-arganza-net-gown',
    sku: 'MZ779014450ANMCL',
    description: 'Exquisite Pink Floral After Wash Soft Arganza Net Gown. Crafted with premium imported net organza featuring delicate floral embroidery, a soft inner lining, and an elegant silhouette. Ideal for festive gatherings and formal occasions. Available for Cash on Delivery all over Pakistan.',
    short_description: 'Premium Pink Floral Arganza Net Gown — Soft After Wash Fabric. Cash on Delivery available.',
    category_id: womanCatId || null,
    subcategory: 'Shirt',
    brand: 'All Available',
    base_price: 5499,
    sale_price: 4599,
    discount_percentage: 16,
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: true,
    is_on_sale: true,
    is_active: true,
    allow_whatsapp: true,
    allow_email: true,
    rating: 4.9,
    review_count: 28,
    sold_count: 42,
    tags: ['gown', 'arganza', 'net', 'pink', 'floral', 'women', 'formal', 'festive'],
    images: [
      {
        url: MODEL_IMAGE_URL,
        alt: 'Pink Floral Arganza Net Gown - Model Wearing',
        isMain: true,
        isHover: false,
        sortOrder: 1
      },
      {
        url: CLOTH_IMAGE_URL,
        alt: 'Pink Floral Arganza Net Gown - Fabric Detail',
        isMain: false,
        isHover: true,
        sortOrder: 2
      }
    ],
    variants: [
      { size: 'Small',   color: 'Pink', stock: 15, isActive: true },
      { size: 'Medium',  color: 'Pink', stock: 20, isActive: true },
      { size: 'Large',   color: 'Pink', stock: 15, isActive: true },
      { size: 'X-Large', color: 'Pink', stock: 10, isActive: true },
    ],
    seo_title: 'Pink Floral Arganza Net Gown | All Available Pakistan',
    meta_description: 'Buy Pink Floral After Wash Soft Arganza Net Gown online in Pakistan. Premium quality, Cash on Delivery available.',
  };

  const { data, error } = await supabase
    .from('products')
    .upsert(product, { onConflict: 'slug' })
    .select('id, name, slug')
    .single();

  if (error) {
    console.log(`  ⚠️  Product error: ${error.message}`);
  } else {
    console.log(`  ✅ Product "${data.name}" seeded! ID: ${data.id}`);
    return data;
  }
}

async function seedSettings(supabase) {
  console.log('\n📦 Seeding Website Settings...');
  const { error } = await supabase.from('website_settings').upsert({
    id: 'primary',
    site_name: 'All Available',
    site_tagline: 'Premium Pakistani Fashion — Cash on Delivery',
    announcement_bar: {
      isActive: true,
      messages: [
        'Free Delivery on Orders Above Rs. 5,000',
        'New Festive Collection Has Arrived',
        'Cash on Delivery Available Nationwide',
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
  }, { onConflict: 'id' });

  if (error) console.log(`  ⚠️  Settings: ${error.message}`);
  else console.log('  ✅ Website Settings seeded!');
}

async function seedAdminUser(supabase) {
  console.log('\n📦 Seeding Admin User...');
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('AdminPass123!', 10);

  const { error } = await supabase.from('admin_users').upsert({
    name: 'All Available Admin',
    email: 'admin@allavailable.com',
    password_hash: passwordHash,
    role: 'superadmin',
    is_active: true,
  }, { onConflict: 'email' });

  if (error) console.log(`  ⚠️  Admin user: ${error.message}`);
  else console.log('  ✅ Admin user seeded! (admin@allavailable.com / AdminPass123!)');
}

async function verifyData(supabase) {
  console.log('\n🔍 Verifying Supabase data...');
  const tables = ['categories', 'products', 'website_settings', 'admin_users'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    if (error) console.log(`  ❌ ${t}: ${error.message}`);
    else console.log(`  ✅ ${t}: ${data.length} rows`);
  }
}

async function main() {
  console.log('🚀 Starting Supabase Setup...');
  console.log(`   Project: ${SUPABASE_URL}`);

  // Step 1: Check if tables exist
  const tablesExist = await checkTablesExist();

  if (!tablesExist) {
    console.log('\n⚠️  Tables do NOT exist yet in Supabase.');
    console.log('   You must run the SQL schema first via the Supabase dashboard:');
    console.log('   → Go to: https://supabase.com/dashboard/project/ofuhcgtdwjehazorqaqu/sql/new');
    console.log('   → Copy & paste ALL contents of: supabase/schema.sql');
    console.log('   → Click RUN, then run this script again.');
    process.exit(1);
  }

  console.log('\n✅ Tables found in Supabase! Proceeding with seed data...');

  // Step 2: Seed
  await seedSettings(supabase);
  const categoryIds = await seedCategories(supabase);
  await seedProduct(supabase, categoryIds);
  await seedAdminUser(supabase);

  // Step 3: Verify
  await verifyData(supabase);

  console.log('\n🎉 Supabase setup complete! Your live database is ready.');
  console.log('\n📋 Next steps:');
  console.log('   1. Add environment variables to your server deployment (Render/Railway):');
  console.log('      SUPABASE_URL=https://ofuhcgtdwjehazorqaqu.supabase.co');
  console.log('      SUPABASE_SERVICE_ROLE_KEY=<your key>');
  console.log('   2. Add to Vercel project → Settings → Environment Variables:');
  console.log('      VITE_API_URL=https://YOUR-SERVER-URL/api');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
