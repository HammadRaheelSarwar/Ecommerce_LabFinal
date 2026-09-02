const slugify = require('slugify');
const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

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
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, categories: (data || []).map(mapCategory) });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/nav (for navigation — active + showInNav)
exports.getNavCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .eq('show_in_nav', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, categories: (data || []).map(mapCategory) });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const cleanSlug = req.params.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let { data: cat, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('slug', `%${cleanSlug}%`)
      .limit(1)
      .maybeSingle();

    if (!cat) {
      const cleanName = req.params.slug.replace(/-/g, ' ');
      const resName = await supabase
        .from('categories')
        .select('*')
        .ilike('name', `%${cleanName}%`)
        .limit(1)
        .maybeSingle();
      cat = resName.data;
    }

    if (!cat) return next(createError('Category not found.', 404));
    res.json({ success: true, category: mapCategory(cat) });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/admin/all  [adminAuth]
exports.getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, categories: (data || []).map(mapCategory) });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories  [adminAuth]
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image, banner, subcategories = [], isActive, showInNav, sortOrder } = req.body;
    if (!name) return next(createError('Category name is required.', 400));

    const generatedSlug = slugify(name, { lower: true, strict: true });
    const payload = {
      name: name.trim(),
      slug: generatedSlug,
      description: description?.trim(),
      image_url: image?.url || req.body.imageUrl || null,
      banner_url: banner?.url || req.body.bannerUrl || null,
      subcategories: subcategories.map(s => ({
        name: s.name,
        slug: s.slug || slugify(s.name, { lower: true, strict: true }),
        img: s.img || s.image?.url || '',
      })),
      is_active: isActive !== false,
      show_in_nav: showInNav !== false,
      sort_order: Number(sortOrder || 0),
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Category created successfully.', category: mapCategory(data) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id  [adminAuth]
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, banner, subcategories, isActive, showInNav, sortOrder } = req.body;
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (name) {
      updates.name = name.trim();
      updates.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) updates.description = description ? description.trim() : null;
    if (image?.url || req.body.imageUrl) updates.image_url = image?.url || req.body.imageUrl;
    if (banner?.url || req.body.bannerUrl) updates.banner_url = banner?.url || req.body.bannerUrl;
    if (subcategories !== undefined) {
      updates.subcategories = subcategories.map(s => ({
        name: s.name,
        slug: s.slug || slugify(s.name, { lower: true, strict: true }),
        img: s.img || s.image?.url || '',
      }));
    }
    if (isActive !== undefined) updates.is_active = isActive;
    if (showInNav !== undefined) updates.show_in_nav = showInNav;
    if (sortOrder !== undefined) updates.sort_order = Number(sortOrder);

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return next(createError('Category not found.', 404));
    res.json({ success: true, message: 'Category updated successfully.', category: mapCategory(data) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id  [adminAuth]
exports.deleteCategory = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
