const Category = require('../models/Category');
const slugify = require('slugify');
const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const isSupabaseConfigured = () => {
  return !!supabase;
};

function mapCategory(c) {
  if (!c) return null;
  return {
    _id: c.id,
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: { url: c.image_url },
    imageUrl: c.image_url,
    banner: { url: c.banner_url },
    bannerUrl: c.banner_url,
    subcategories: (c.subcategories || []).map(s => ({
      name: s.name,
      slug: s.slug,
      img: s.image?.url || s.img || '',
      image: s.image || { url: s.img || '' },
    })),
    isActive: c.is_active,
    showInNav: c.show_in_nav,
    sortOrder: c.sort_order,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

// GET /api/categories  (public)
exports.getCategories = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return res.json({ success: true, categories: (data || []).map(mapCategory) });
    }

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
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .eq('show_in_nav', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return res.json({ success: true, categories: (data || []).map(mapCategory) });
    }

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
    const { slug } = req.params;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return next(createError('Category not found.', 404));
      return res.json({ success: true, category: mapCategory(data) });
    }

    const category = await Category.findOne({ slug, isActive: true });
    if (!category) return next(createError('Category not found.', 404));
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/admin/all [adminAuth]
exports.getAllCategoriesAdmin = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return res.json({ success: true, categories: (data || []).map(mapCategory) });
    }

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

    const processedSubs = subcategories.map((sub) => ({
      name: sub.name,
      slug: sub.slug ? slugify(sub.slug, { lower: true, strict: true }) : slugify(sub.name, { lower: true, strict: true }),
      image: sub.image || { url: sub.img || '' },
      isActive: true,
    }));

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('categories').insert({
        name,
        slug,
        description: req.body.description,
        image_url: req.body.image?.url,
        banner_url: req.body.banner?.url,
        subcategories: processedSubs,
        is_active: req.body.isActive !== false,
        show_in_nav: req.body.showInNav !== false,
        sort_order: req.body.sortOrder || 0,
      }).select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Category created.', category: mapCategory(data) });
    }

    const category = await Category.create({
      ...req.body,
      slug,
      subcategories: processedSubs,
    });
    res.status(201).json({ success: true, message: 'Category created.', category });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id [adminAuth]
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('categories').update({
        name: req.body.name,
        description: req.body.description,
        image_url: req.body.image?.url,
        banner_url: req.body.banner?.url,
        subcategories: req.body.subcategories,
        is_active: req.body.isActive,
        show_in_nav: req.body.showInNav,
        sort_order: req.body.sortOrder,
        updated_at: new Date().toISOString(),
      }).eq('id', id).select().single();
      if (error) throw error;
      return res.json({ success: true, message: 'Category updated.', category: mapCategory(data) });
    }

    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) return next(createError('Category not found.', 404));
    res.json({ success: true, message: 'Category updated.', category });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id [adminAuth]
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true, message: 'Category deleted.' });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return next(createError('Category not found.', 404));
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};
