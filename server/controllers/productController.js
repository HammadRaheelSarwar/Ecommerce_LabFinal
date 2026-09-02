const slugify = require('slugify');
const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

function mapSupabaseProduct(p) {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    shortDescription: p.short_description,
    category: p.category || (p.category_id ? { _id: p.category_id, id: p.category_id } : null),
    categoryId: p.category_id,
    subcategory: p.subcategory,
    brand: p.brand || 'All Available',
    gender: p.gender || 'women',
    material: p.material,
    tags: p.tags || [],
    basePrice: Number(p.base_price || 0),
    salePrice: p.sale_price ? Number(p.sale_price) : null,
    costPrice: p.cost_price ? Number(p.cost_price) : null,
    discountPercentage: p.discount_percentage || 0,
    variants: p.variants || [],
    images: p.images || [],
    isFeatured: p.is_featured,
    isNewArrival: p.is_new_arrival,
    isBestSeller: p.is_best_seller,
    isOnSale: p.is_on_sale,
    isActive: p.is_active,
    allowWhatsApp: p.allow_whatsapp !== false,
    allowEmail: p.allow_email !== false,
    rating: Number(p.rating || 4.8),
    reviewCount: p.review_count || 0,
    soldCount: p.sold_count || 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, sort = 'featured', ...queryParams } = req.query;

    let query = supabase.from('products').select('*, category:categories(id, name, slug)', { count: 'exact' });
    query = query.eq('is_active', true);

    if (queryParams.category) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryParams.category);
      if (isUuid) {
        query = query.eq('category_id', queryParams.category);
      } else {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .ilike('slug', `%${queryParams.category}%`)
          .limit(1)
          .maybeSingle();

        if (cat?.id) {
          query = query.eq('category_id', cat.id);
        }
      }
    }

    if (queryParams.subcategory) {
      query = query.ilike('subcategory', `%${queryParams.subcategory}%`);
    }

    if (queryParams.featured === 'true' || queryParams.featured === true) {
      query = query.eq('is_featured', true);
    }
    if (queryParams.newArrival === 'true' || queryParams.newArrival === true) {
      query = query.eq('is_new_arrival', true);
    }
    if (queryParams.bestSeller === 'true' || queryParams.bestSeller === true) {
      query = query.eq('is_best_seller', true);
    }
    if (queryParams.search) {
      query = query.or(`name.ilike.%${queryParams.search}%,sku.ilike.%${queryParams.search}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('sale_price', { ascending: true, nullsFirst: false });
        break;
      case 'price_desc':
        query = query.order('sale_price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'bestselling':
        query = query.order('sold_count', { ascending: false });
        break;
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: products, count, error } = await query.range(from, to);
    if (error) throw error;

    return res.json({
      success: true,
      products: (products || []).map(mapSupabaseProduct),
      total: count || 0,
      pages: Math.ceil((count || 0) / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/slug/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !product) return next(createError('Product not found.', 404));
    return res.json({ success: true, product: mapSupabaseProduct(product) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/id/:id
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('id', id)
      .maybeSingle();

    if (error || !product) return next(createError('Product not found.', 404));
    return res.json({ success: true, product: mapSupabaseProduct(product) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/similar/:slug
exports.getSimilarProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const limit = Number(req.query.limit || 8);

    const { data: current } = await supabase
      .from('products')
      .select('category_id, subcategory')
      .eq('slug', slug)
      .maybeSingle();

    let query = supabase.from('products').select('*').eq('is_active', true).neq('slug', slug).limit(limit);

    if (current?.subcategory) {
      query = query.eq('subcategory', current.subcategory);
    } else if (current?.category_id) {
      query = query.eq('category_id', current.category_id);
    }

    const { data: similar, error } = await query;
    if (error) throw error;

    return res.json({ success: true, products: (similar || []).map(mapSupabaseProduct) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 8);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);

    if (error) throw error;
    return res.json({ success: true, products: (data || []).map(mapSupabaseProduct) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/best-sellers
exports.getBestSellers = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 8);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_best_seller', true)
      .limit(limit);

    if (error) throw error;
    return res.json({ success: true, products: (data || []).map(mapSupabaseProduct) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/new-arrivals
exports.getNewArrivals = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 8);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_new_arrival', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return res.json({ success: true, products: (data || []).map(mapSupabaseProduct) });
  } catch (err) {
    next(err);
  }
};

// POST /api/products  [adminAuth]
exports.createProduct = async (req, res, next) => {
  try {
    const { name, sku, basePrice, salePrice, category, subcategory, variants, images, isFeatured, isNewArrival, isBestSeller, isOnSale, isActive } = req.body;
    if (!name || !basePrice) return next(createError('Product name and base price are required.', 400));

    const generatedSlug = slugify(`${name}-${sku || Date.now()}`, { lower: true, strict: true });
    const payload = {
      name: name.trim(),
      slug: generatedSlug,
      sku: sku?.trim(),
      category_id: category || null,
      subcategory: subcategory?.trim(),
      base_price: Number(basePrice),
      sale_price: salePrice ? Number(salePrice) : null,
      variants: variants || [],
      images: images || [],
      is_featured: !!isFeatured,
      is_new_arrival: !!isNewArrival,
      is_best_seller: !!isBestSeller,
      is_on_sale: !!isOnSale,
      is_active: isActive !== false,
    };

    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Product created successfully.', product: mapSupabaseProduct(data) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id  [adminAuth]
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = {
      updated_at: new Date().toISOString(),
    };
    const fields = [
      ['name', 'name'],
      ['sku', 'sku'],
      ['description', 'description'],
      ['shortDescription', 'short_description'],
      ['category', 'category_id'],
      ['subcategory', 'subcategory'],
      ['basePrice', 'base_price'],
      ['salePrice', 'sale_price'],
      ['variants', 'variants'],
      ['images', 'images'],
      ['isFeatured', 'is_featured'],
      ['isNewArrival', 'is_new_arrival'],
      ['isBestSeller', 'is_best_seller'],
      ['isOnSale', 'is_on_sale'],
      ['isActive', 'is_active'],
    ];

    fields.forEach(([bodyField, dbField]) => {
      if (req.body[bodyField] !== undefined) updates[dbField] = req.body[bodyField];
    });

    const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
    if (error || !data) return next(createError('Product not found.', 404));
    return res.json({ success: true, message: 'Product updated successfully.', product: mapSupabaseProduct(data) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/admin/all  [adminAuth]
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    let query = supabase.from('products').select('*, category:categories(id, name, slug)', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category_id', category);
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: products, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.json({
      success: true,
      products: (products || []).map(mapSupabaseProduct),
      total: count || 0,
      pages: Math.ceil((count || 0) / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/duplicate  [adminAuth]
exports.duplicateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: orig, error: fetchErr } = await supabase.from('products').select('*').eq('id', id).single();
    if (fetchErr || !orig) return next(createError('Product not found.', 404));

    const newSlug = slugify(`${orig.name}-copy-${Date.now()}`, { lower: true, strict: true });
    const payload = {
      ...orig,
      id: undefined,
      name: `${orig.name} (Copy)`,
      slug: newSlug,
      sku: orig.sku ? `${orig.sku}-COPY` : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    delete payload.id;

    const { data: newProd, error: insertErr } = await supabase.from('products').insert(payload).select().single();
    if (insertErr) throw insertErr;

    return res.status(201).json({
      success: true,
      message: 'Product duplicated successfully.',
      product: mapSupabaseProduct(newProd),
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  [adminAuth]
exports.deleteProduct = async (req, res, next) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
