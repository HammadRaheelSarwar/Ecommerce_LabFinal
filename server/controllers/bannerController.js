const Banner = require('../models/Banner');
const { createError } = require('../middleware/errorHandler');

// GET /api/banners?location=hero  [public]
exports.getActiveBanners = async (req, res, next) => {
  try {
    const { location } = req.query;
    const now = new Date();
    const filter = {
      isActive: true,
      $or: [
        { scheduledFrom: { $exists: false } },
        { scheduledFrom: null },
        { scheduledFrom: { $lte: now } },
      ],
      $and: [
        {
          $or: [
            { scheduledTo: { $exists: false } },
            { scheduledTo: null },
            { scheduledTo: { $gte: now } },
          ],
        },
      ],
    };
    if (location) filter.location = location;

    const banners = await Banner.find(filter).sort({ sortOrder: 1 }).lean();
    res.json({ success: true, banners });
  } catch (err) {
    next(err);
  }
};

// GET /api/banners/admin  [adminAuth]
exports.getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, banners });
  } catch (err) {
    next(err);
  }
};

// POST /api/banners  [adminAuth]
exports.createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, message: 'Banner created.', banner });
  } catch (err) {
    next(err);
  }
};

// PUT /api/banners/:id  [adminAuth]
exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return next(createError('Banner not found.', 404));
    res.json({ success: true, message: 'Banner updated.', banner });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/banners/:id  [adminAuth]
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return next(createError('Banner not found.', 404));
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (err) {
    next(err);
  }
};
