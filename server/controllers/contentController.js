const WebsiteSettings = require('../models/WebsiteSettings');
const HomepageSection = require('../models/HomepageSection');
const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const isSupabaseConfigured = () => {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
};

function mapSettings(s) {
  if (!s) return null;
  return {
    _id: s.id,
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
    if (isSupabaseConfigured()) {
      let { data, error } = await supabase.from('website_settings').select('*').eq('id', 'primary').maybeSingle();
      if (!data) {
        // Create primary settings if not existing
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
            whatsappDefaultMessage: '',
            emailDefaultMessage: '',
          },
        };
        const { data: created } = await supabase.from('website_settings').upsert(defaultSet).select().single();
        data = created;
      }
      return res.json({ success: true, settings: mapSettings(data) });
    }

    let settings = await WebsiteSettings.findOne();
    if (!settings) settings = await WebsiteSettings.create({});
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/content/settings  [adminAuth]
exports.updateSettings = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
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
    }

    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, message: 'Settings updated.', settings });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/homepage  [public]
exports.getHomepageSections = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('homepage_sections').select('*').eq('is_active', true);
      if (error) throw error;
      const keyed = (data || []).reduce((acc, s) => {
        acc[s.slug || s.type] = s;
        return acc;
      }, {});
      return res.json({ success: true, sections: keyed });
    }

    const sections = await HomepageSection.find({ isActive: true }).lean();
    const keyed = sections.reduce((acc, s) => {
      acc[s.sectionKey] = s;
      return acc;
    }, {});
    res.json({ success: true, sections: keyed });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/homepage/admin  [adminAuth]
exports.getHomepageSectionsAdmin = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('homepage_sections').select('*');
      if (error) throw error;
      return res.json({ success: true, sections: data });
    }

    const sections = await HomepageSection.find().lean();
    res.json({ success: true, sections });
  } catch (err) {
    next(err);
  }
};

// PUT /api/content/homepage/:sectionKey  [adminAuth]
exports.updateHomepageSection = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('homepage_sections').upsert({
        slug: req.params.sectionKey,
        ...req.body,
      }).select().single();
      if (error) throw error;
      return res.json({ success: true, message: 'Section updated.', section: data });
    }

    const section = await HomepageSection.findOneAndUpdate(
      { sectionKey: req.params.sectionKey },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Section updated.', section });
  } catch (err) {
    next(err);
  }
};
