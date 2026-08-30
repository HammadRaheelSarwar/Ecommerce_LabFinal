const Category = require('../models/Category');
const slugify = require('slugify');
const { createError } = require('../middleware/errorHandler');

// GET /api/categories  (public)
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/nav (for navigation — active + showInNav)
exports.getNavCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true, showInNav: true })
      .sort({ sortOrder: 1 })
      .select('name slug image subcategories')
      .lean();
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:slug (public)
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return next(createError('Category not found.', 404));
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/admin/all [adminAuth]
exports.getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories [adminAuth]
exports.createCategory = async (req, res, next) => {
  try {
    const { name, subcategories = [] } = req.body;
    if (!name) return next(createError('Category name is required.', 400));

    const slug = slugify(name, { lower: true, strict: true });

    // Process subcategory slugs
    const processedSubs = subcategories.map((sub) => ({
      ...sub,
      slug: sub.slug || slugify(sub.name, { lower: true, strict: true }),
    }));

    const category = await Category.create({ ...req.body, slug, subcategories: processedSubs });
    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id [adminAuth]
exports.updateCategory = async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return next(createError('Category not found.', 404));
    res.json({ success: true, message: 'Category updated.', category });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id [adminAuth]
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(createError('Category not found.', 404));
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};
