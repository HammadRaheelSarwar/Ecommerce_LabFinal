require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const parsedProducts = JSON.parse(fs.readFileSync(path.join(__dirname, 'parsed_products.json')));
const imageMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'image_map.json')));

async function seed() {
  console.log('📦 Finding or creating Women\'s Unstitched category in Supabase...');

  let { data: category } = await supabase
    .from('categories')
    .select('*')
    .or('slug.eq.women-s-unstitched,slug.eq.womens-unstitched')
    .limit(1)
    .single();

  if (!category) {
    console.log('Creating Women\'s Unstitched category...');
    const { data: newCat, error: catErr } = await supabase
      .from('categories')
      .insert({
        name: "Women's Unstitched",
        slug: "women-s-unstitched",
        description: "Unstitched fabric collections for women",
        subcategories: [
          { name: "Shirt", slug: "shirt" },
          { name: "2 Piece Suits", slug: "2-piece-suits" },
          { name: "Kurti", slug: "kurti" },
          { name: "Women's Lehenga", slug: "womens-lehenga" },
          { name: "Trouser", slug: "trouser" },
          { name: "3 Piece Suits", slug: "3-piece-suits" },
          { name: "Saree", slug: "saree" }
        ],
        is_active: true,
        show_in_nav: true,
        sort_order: 1
      })
      .select('*')
      .single();
    if (catErr) throw catErr;
    category = newCat;
  }

  console.log(`✅ Category Ready: "${category.name}" (ID: ${category.id})`);

  console.log(`\n🚀 Inserting/Updating 48 Products into Supabase under Subcategory: Shirt...`);

  let successCount = 0;

  for (const item of parsedProducts) {
    const folderNum = parseInt(item.folder.replace(/\D/g, ''), 10) || 0;
    const price = item.price || 1000;
    const basePrice = Math.round(price * 1.25);
    const salePrice = price;

    let material = '3-D Block Printed Cotton Lawn';
    const lowerName = item.name.toLowerCase();
    if (lowerName.includes('organza') || lowerName.includes('arganza')) {
      material = 'Soft Organza Net';
    } else if (lowerName.includes('swiss lawn') || lowerName.includes('lawn')) {
      material = 'Swiss Lawn';
    } else if (lowerName.includes('dhaga')) {
      material = 'Embroidered Lawn/Cotton';
    } else if (lowerName.includes('lehenga')) {
      material = 'Embroidered Net & Silk';
    }

    const images = (imageMap[item.folder] || []).map((img, idx) => ({
      url: img.url,
      alt: `${item.name} - View ${idx + 1}`,
      isMain: img.isMain,
      isHover: img.isHover,
      sortOrder: img.sortOrder
    }));

    const cleanSlug = slugify(`${item.name}-${item.sku}-p${folderNum}`, {
      lower: true,
      strict: true
    });

    const isFeatured = [1, 6, 9, 14, 25, 30, 36, 44].includes(folderNum);
    const isBestSeller = [1, 2, 6, 13, 20, 25, 31, 41].includes(folderNum);

    const productPayload = {
      name: item.name,
      slug: cleanSlug,
      sku: item.sku,
      description: `Exquisite ${item.name}. (Product ID: ${item.sku}). Crafted with premium ${material} featuring fine detailing, vibrant colors, and authentic Pakistani styling. Unstitched piece ready to be custom tailored. Ideal for casual daily wear and festive occasions. Available for Cash on Delivery nationwide.`,
      short_description: `Authentic ${item.name} (ID: ${item.sku}). Premium ${material} unstitched fabric. Cash on Delivery available.`,
      category_id: category.id,
      subcategory: 'Shirt',
      brand: 'All Available',
      gender: 'women',
      material: material,
      tags: ['women', 'unstitched', 'shirt', 'lawn', 'pakistani fashion', 'summer wear', item.sku],
      base_price: basePrice,
      sale_price: salePrice,
      discount_percentage: 20,
      variants: [
        {
          size: 'Unstitched',
          color: 'As Shown',
          stock: 30,
          isActive: true
        }
      ],
      images: images,
      is_featured: isFeatured,
      is_new_arrival: true,
      is_best_seller: isBestSeller,
      is_on_sale: true,
      is_active: true,
      allow_whatsapp: true,
      allow_email: true,
      rating: +(4.7 + ((folderNum % 3) * 0.1)).toFixed(1),
      review_count: 15 + (folderNum % 25),
      sold_count: 40 + (folderNum * 3),
      seo_title: `${item.name} - ${item.sku} | All Available`,
      meta_description: `Buy ${item.name} online in Pakistan. Genuine product (ID: ${item.sku}) with Cash on Delivery.`
    };

    const { data, error } = await supabase
      .from('products')
      .upsert(productPayload, { onConflict: 'slug' })
      .select('id, name, sku, slug')
      .single();

    if (error) {
      console.error(`❌ [${item.folder}] Error upserting ${item.name}:`, error.message);
    } else {
      successCount++;
      console.log(`✅ [${item.folder}] ${data.name} (SKU: ${data.sku}, Price: Rs. ${salePrice}) inserted.`);
    }
  }

  console.log(`\n🎉 Successfully processed ${successCount} out of ${parsedProducts.length} products in Supabase!`);

  // Verify total count in Supabase
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('subcategory', 'Shirt');

  console.log(`📊 Total products in Women's Unstitched -> Shirt: ${count}`);
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
