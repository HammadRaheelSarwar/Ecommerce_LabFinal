const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('slugify');
const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const isSupabaseConfigured = () => {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
};

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
    category: p.category,
    categoryId: p.category_id,
    subcategory: p.subcategory,
    brand: p.brand,
    gender: p.gender,
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
    rating: Number(p.rating || 5),
    reviewCount: p.review_count || 0,
    soldCount: p.sold_count || 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = 'featured', ...queryParams } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabase.from('products').select('*, category:categories(id, name, slug)', { count: 'exact' });

      query = query.eq('is_active', true);

      if (queryParams.category) {
        // Can be category id or slug
        if (queryParams.category.match(/^[0-9a-fA-F-]{36}$/)) {
          query = query.eq('category_id', queryParams.category);
        } else {
          const { data: cat } = await supabase.from('categories').select('id').eq('slug', queryParams.category).maybeSingle();
          if (cat) query = query.eq('category_id', cat.id);
        }
      }

      if (queryParams.subcategory) {
        query = query.eq('subcategory', queryParams.subcategory);
      }
      if (queryParams.gender) query = query.eq('gender', queryParams.gender);
      if (queryParams.brand) query = query.eq('brand', queryParams.brand);
      if (queryParams.isNewArrival === 'true') query = query.eq('is_new_arrival', true);
      if (queryParams.isBestSeller === 'true') query = query.eq('is_best_seller', true);
      if (queryParams.isFeatured === 'true') query = query.eq('is_featured', true);
      if (queryParams.isOnSale === 'true') query = query.eq('is_on_sale', true);
      if (queryParams.minPrice) query = query.gte('base_price', Number(queryParams.minPrice));
      if (queryParams.maxPrice) query = query.lte('base_price', Number(queryParams.maxPrice));
      if (queryParams.search) {
        query = query.ilike('name', `%${queryParams.search}%`);
      }

      // Sort
      switch (sort) {
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'price_asc': query = query.order('base_price', { ascending: true }); break;
        case 'price_desc': query = query.order('base_price', { ascending: false }); break;
        case 'popular': query = query.order('sold_count', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        default: query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false }); break;
      }

      const from = (Number(page) - 1) * Number(limit);
      const to = from + Number(limit) - 1;
      const { data, count, error } = await query.range(from, to);

      if (error) throw error;

      return res.json({
        success: true,
        products: (data || []).map(mapSupabaseProduct),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / Number(limit)),
        },
      });
    }

    // Mongoose fallback
    const filter = { isActive: true };
    if (queryParams.category) filter.category = queryParams.category;
    if (queryParams.subcategory) filter.subcategory = queryParams.subcategory;
    if (queryParams.gender) filter.gender = queryParams.gender;
    if (queryParams.brand) filter.brand = queryParams.brand;
    if (queryParams.isNewArrival === 'true') filter.isNewArrival = true;
    if (queryParams.isBestSeller === 'true') filter.isBestSeller = true;
    if (queryParams.isFeatured === 'true') filter.isFeatured = true;
    if (queryParams.isOnSale === 'true') filter.isOnSale = true;
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.basePrice = {};
      if (queryParams.minPrice) filter.basePrice.$gte = Number(queryParams.minPrice);
      if (queryParams.maxPrice) filter.basePrice.$lte = Number(queryParams.maxPrice);
    }
    if (queryParams.search) filter.$text = { $search: queryParams.search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/slug/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return next(createError('Product not found.', 404));

      return res.json({ success: true, product: mapSupabaseProduct(data) });
    }

    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug');
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/slug/:slug/similar
exports.getSimilarProducts = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 12, 30);

    if (isSupabaseConfigured()) {
      // Find reference product
      let targetQuery = supabase.from('products').select('*');
      if (slugOrId.match(/^[0-9a-fA-F-]{36}$/)) {
        targetQuery = targetQuery.eq('id', slugOrId);
      } else {
        targetQuery = targetQuery.eq('slug', slugOrId);
      }
      const { data: target } = await targetQuery.maybeSingle();

      if (!target) return next(createError('Product not found.', 404));

      let query = supabase
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .neq('id', target.id)
        .eq('is_active', true)
        .limit(limit);

      if (target.category_id) {
        query = query.eq('category_id', target.category_id);
      }

      const { data: similar, error } = await query;
      if (error) throw error;

      return res.json({ success: true, products: (similar || []).map(mapSupabaseProduct) });
    }

    // Mongoose fallback
    let target = await Product.findOne({ $or: [{ slug: slugOrId }, { _id: slugOrId.match(/^[0-9a-fA-F]{24}$/) ? slugOrId : null }] }).lean();
    if (!target) return next(createError('Product not found.', 404));

    const similar = await Product.find({ _id: { $ne: target._id }, isActive: true, category: target.category })
      .populate('category', 'name slug')
      .limit(limit)
      .lean();

    res.json({ success: true, products: similar });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/id/:id  (admin use)
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return next(createError('Product not found.', 404));
      return res.json({ success: true, product: mapSupabaseProduct(data) });
    }

    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// Admin: getAllProductsAdmin, createProduct, updateProduct, deleteProduct, duplicateProduct
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ success: true, products: (data || []).map(mapSupabaseProduct) });
    }
    const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 }).lean();
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, basePrice, category } = req.body;
    if (!name) return next(createError('Product name is required.', 400));

    let slug = slugify(name, { lower: true, strict: true });

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('products').insert({
        name,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        sku: req.body.sku,
        description: req.body.description,
        short_description: req.body.shortDescription,
        category_id: category,
        subcategory: req.body.subcategory,
        brand: req.body.brand || 'All Available',
        gender: req.body.gender || 'unisex',
        base_price: Number(basePrice || 0),
        sale_price: req.body.salePrice ? Number(req.body.salePrice) : null,
        discount_percentage: req.body.discountPercentage || 0,
        variants: req.body.variants || [],
        images: req.body.images || [],
        is_featured: !!req.body.isFeatured,
        is_new_arrival: !!req.body.isNewArrival,
        is_best_seller: !!req.body.isBestSeller,
        is_active: req.body.isActive !== false,
        allow_whatsapp: req.body.allowWhatsApp !== false,
        allow_email: req.body.allowEmail !== false,
      }).select().single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Product created.', product: mapSupabaseProduct(data) });
    }

    const product = await Product.create({ ...req.body, slug });
    res.status(201).json({ success: true, message: 'Product created.', product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('products').update({
        name: req.body.name,
        sku: req.body.sku,
        description: req.body.description,
        short_description: req.body.shortDescription,
        category_id: req.body.category,
        subcategory: req.body.subcategory,
        brand: req.body.brand,
        gender: req.body.gender,
        base_price: req.body.basePrice ? Number(req.body.basePrice) : undefined,
        sale_price: req.body.salePrice ? Number(req.body.salePrice) : null,
        discount_percentage: req.body.discountPercentage,
        variants: req.body.variants,
        images: req.body.images,
        is_featured: req.body.isFeatured,
        is_new_arrival: req.body.isNewArrival,
        is_best_seller: req.body.isBestSeller,
        is_active: req.body.isActive,
        allow_whatsapp: req.body.allowWhatsApp,
        allow_email: req.body.allowEmail,
        updated_at: new Date().toISOString(),
      }).eq('id', id).select().single();

      if (error) throw error;
      return res.json({ success: true, message: 'Product updated.', product: mapSupabaseProduct(data) });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, message: 'Product updated.', product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true, message: 'Product deleted.' });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.duplicateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      const { data: original, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !original) return next(createError('Product not found.', 404));

      delete original.id;
      original.name = `${original.name} (Copy)`;
      original.slug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
      original.created_at = new Date().toISOString();

      const { data: copy, error: copyErr } = await supabase.from('products').insert(original).select().single();
      if (copyErr) throw copyErr;

      return res.status(201).json({ success: true, message: 'Product duplicated.', product: mapSupabaseProduct(copy) });
    }

    const original = await Product.findById(id).lean();
    if (!original) return next(createError('Product not found.', 404));
    delete original._id;
    original.name = `${original.name} (Copy)`;
    original.slug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const copy = await Product.create(original);
    res.status(201).json({ success: true, message: 'Product duplicated.', product: copy });
  } catch (err) {
    next(err);
  }
};
