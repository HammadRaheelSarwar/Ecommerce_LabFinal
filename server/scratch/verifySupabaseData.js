require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  const { data: cat } = await supabase.from('categories').select('*').ilike('slug', '%women-s-unstitched%').single();
  console.log('Category found:', cat.name, 'id:', cat.id);

  const { data: prods, count, error } = await supabase
    .from('products')
    .select('name, sku, sale_price, subcategory, images', { count: 'exact' })
    .eq('category_id', cat.id)
    .eq('subcategory', 'Shirt')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  console.log(`\n🎉 Found ${count} products in Women's Unstitched -> Shirt:\n`);
  prods.forEach((p, idx) => {
    const imgUrl = p.images?.[0]?.url || 'No image';
    console.log(`${(idx + 1).toString().padStart(2, ' ')}. ${p.name} | SKU: ${p.sku} | Rs. ${p.sale_price} | Img: ${imgUrl}`);
  });
}

verify();
