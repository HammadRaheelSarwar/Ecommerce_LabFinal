const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

function formatBanner(b) {
  if (!b) return null;
  return {
    _id: b.id,
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    location: b.location || 'hero',
    imageUrl: b.image_url,
    image: { url: b.image_url },
    mobileImageUrl: b.mobile_image_url,
    link: b.link,
    ctaText: b.cta_text,
    sortOrder: b.sort_order || 0,
    isActive: b.is_active,
    createdAt: b.created_at,
  };
}

// GET /api/banners?location=hero  [public]
exports.getActiveBanners = async (req, res, next) => {
  try {
    const { location } = req.query;
    let query = supabase.from('banners').select('*').eq('is_active', true);
    if (location) query = query.eq('location', location);

    const { data, error } = await query.order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ success: true, banners: (data || []).map(formatBanner) });
  } catch (err) {
    next(err);
  }
};

// GET /api/banners/admin  [adminAuth]
exports.getAllBannersAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, banners: (data || []).map(formatBanner) });
  } catch (err) {
    next(err);
  }
};

// POST /api/banners  [adminAuth]
exports.createBanner = async (req, res, next) => {
  try {
    const payload = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      location: req.body.location || 'hero',
      image_url: req.body.imageUrl || req.body.image?.url,
      mobile_image_url: req.body.mobileImageUrl,
      link: req.body.link,
      cta_text: req.body.ctaText,
      sort_order: req.body.sortOrder || 0,
      is_active: req.body.isActive !== false,
    };

    const { data, error } = await supabase.from('banners').insert(payload).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Banner created.', banner: formatBanner(data) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/banners/:id  [adminAuth]
exports.updateBanner = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.subtitle !== undefined) updates.subtitle = req.body.subtitle;
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.imageUrl !== undefined || req.body.image?.url) updates.image_url = req.body.imageUrl || req.body.image?.url;
    if (req.body.mobileImageUrl !== undefined) updates.mobile_image_url = req.body.mobileImageUrl;
    if (req.body.link !== undefined) updates.link = req.body.link;
    if (req.body.ctaText !== undefined) updates.cta_text = req.body.ctaText;
    if (req.body.sortOrder !== undefined) updates.sort_order = req.body.sortOrder;
    if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;

    const { data, error } = await supabase.from('banners').update(updates).eq('id', req.params.id).select().single();
    if (error || !data) return next(createError('Banner not found.', 404));
    res.json({ success: true, message: 'Banner updated.', banner: formatBanner(data) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/banners/:id  [adminAuth]
exports.deleteBanner = async (req, res, next) => {
  try {
    const { error } = await supabase.from('banners').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (err) {
    next(err);
  }
};
