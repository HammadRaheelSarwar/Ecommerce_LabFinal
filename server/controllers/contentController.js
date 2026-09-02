const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

function mapSettings(s) {
  if (!s) return null;
  return {
    _id: s.id,
    id: s.id,
    siteName: s.site_name,
    siteTagline: s.site_tagline,
    logo: s.logo,
    favicon: s.favicon,
    announcementBar: s.announcement_bar || {},
    contact: s.contact || {},
    ordering: s.ordering || {},
    social: s.social || {},
    shipping: s.shipping || {},
    footer: s.footer || {},
    updatedAt: s.updated_at,
  };
}

// GET /api/content/settings  [public]
exports.getSettings = async (req, res, next) => {
  try {
    let { data, error } = await supabase.from('website_settings').select('*').eq('id', 'primary').maybeSingle();
    if (!data) {
      const defaultSet = {
        id: 'primary',
        site_name: 'All Available',
        site_tagline: 'Everything You Desire, All Available.',
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
      };
      const { data: created } = await supabase.from('website_settings').upsert(defaultSet).select().single();
      data = created;
    }
    return res.json({ success: true, settings: mapSettings(data) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/content/settings  [adminAuth]
exports.updateSettings = async (req, res, next) => {
  try {
    const payload = {
      id: 'primary',
      site_name: req.body.siteName,
      site_tagline: req.body.siteTagline,
      announcement_bar: req.body.announcementBar,
      contact: req.body.contact,
      ordering: req.body.ordering,
      social: req.body.social || req.body.socialLinks,
      shipping: req.body.shipping,
      footer: req.body.footer,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('website_settings').upsert(payload).select().single();
    if (error) throw error;
    return res.json({ success: true, message: 'Settings updated.', settings: mapSettings(data) });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/homepage  [public]
exports.getHomepageSections = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('homepage_sections').select('*').eq('is_active', true);
    if (error) throw error;
    const keyed = (data || []).reduce((acc, s) => {
      acc[s.slug || s.type] = s;
      return acc;
    }, {});
    return res.json({ success: true, sections: keyed });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/homepage/admin  [adminAuth]
exports.getHomepageSectionsAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('homepage_sections').select('*');
    if (error) throw error;
    return res.json({ success: true, sections: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/content/homepage/:sectionKey  [adminAuth]
exports.updateHomepageSection = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('homepage_sections').upsert({
      slug: req.params.sectionKey,
      ...req.body,
    }).select().single();
    if (error) throw error;
    return res.json({ success: true, message: 'Section updated.', section: data });
  } catch (err) {
    next(err);
  }
};
