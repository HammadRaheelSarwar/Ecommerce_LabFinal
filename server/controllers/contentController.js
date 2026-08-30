const WebsiteSettings = require('../models/WebsiteSettings');
const HomepageSection = require('../models/HomepageSection');
const { createError } = require('../middleware/errorHandler');

// GET /api/content/settings  [public]
exports.getSettings = async (req, res, next) => {
  try {
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
    const sections = await HomepageSection.find({ isActive: true }).lean();
    // Convert to keyed object for easy frontend consumption
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
    const sections = await HomepageSection.find().lean();
    res.json({ success: true, sections });
  } catch (err) {
    next(err);
  }
};

// PUT /api/content/homepage/:sectionKey  [adminAuth]
exports.updateHomepageSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findOneAndUpdate(
      { sectionKey: req.params.sectionKey },
      { ...req.body, sectionKey: req.params.sectionKey },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, message: 'Section updated.', section });
  } catch (err) {
    next(err);
  }
};
