const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('slugify');
const { createError } = require('../middleware/errorHandler');

// Build a query object from request query params
const buildProductQuery = (query) => {
  const filter = { isActive: true };

  if (query.category) filter.category = query.category;
  if (query.subcategory) filter.subcategory = query.subcategory;
  if (query.gender) filter.gender = query.gender;
  if (query.brand) filter.brand = query.brand;
  if (query.isNewArrival === 'true') filter.isNewArrival = true;
  if (query.isBestSeller === 'true') filter.isBestSeller = true;
  if (query.isFeatured === 'true') filter.isFeatured = true;
  if (query.isOnSale === 'true') filter.isOnSale = true;

  if (query.minPrice || query.maxPrice) {
    filter.basePrice = {};
    if (query.minPrice) filter.basePrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.basePrice.$lte = Number(query.maxPrice);
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

const buildSortOption = (sort) => {
  switch (sort) {
    case 'newest': return { createdAt: -1 };
    case 'price_asc': return { basePrice: 1 };
    case 'price_desc': return { basePrice: -1 };
    case 'popular': return { soldCount: -1 };
    case 'best_selling': return { soldCount: -1 };
    case 'rating': return { rating: -1 };
    default: return { isFeatured: -1, createdAt: -1 };
  }
};

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = 'featured', ...queryParams } = req.query;
    const filter = buildProductQuery(queryParams);
    const sortOption = buildSortOption(sort);
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOption)
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

// GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/id/:id  (admin use)
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products  [adminAuth]
exports.createProduct = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return next(createError('Product name is required.', 400));

    let slug = slugify(name, { lower: true, strict: true });
    // Ensure unique slug
    const existing = await Product.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await Product.create({ ...req.body, slug });

    res.status(201).json({ success: true, message: 'Product created.', product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id  [adminAuth]
exports.updateProduct = async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, message: 'Product updated.', product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  [adminAuth]
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(createError('Product not found.', 404));
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/duplicate  [adminAuth]
exports.duplicateProduct = async (req, res, next) => {
  try {
    const original = await Product.findById(req.params.id).lean();
    if (!original) return next(createError('Product not found.', 404));

    delete original._id;
    original.name = `${original.name} (Copy)`;
    original.slug = `${original.slug}-copy-${Date.now()}`;
    original.isActive = false;
    original.soldCount = 0;
    original.rating = 0;
    original.reviewCount = 0;

    const copy = await Product.create(original);
    res.status(201).json({ success: true, message: 'Product duplicated.', product: copy });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/admin/all  [adminAuth] — includes inactive
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};
