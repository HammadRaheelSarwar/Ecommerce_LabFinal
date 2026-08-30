const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { createError } = require('../middleware/errorHandler');

// POST /api/newsletter/subscribe  [public]
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('Email is required.', 400));

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return res.json({ success: true, message: 'You have been re-subscribed.' });
      }
      return res.json({ success: true, message: 'You are already subscribed.' });
    }

    await NewsletterSubscriber.create({ email, source: req.body.source || 'homepage' });
    res.status(201).json({ success: true, message: 'Subscribed successfully. Welcome to All Available!' });
  } catch (err) {
    next(err);
  }
};

// GET /api/newsletter/subscribers  [adminAuth]
exports.getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      NewsletterSubscriber.countDocuments(),
    ]);
    res.json({ success: true, subscribers, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/newsletter/subscribers/:id  [adminAuth]
exports.deleteSubscriber = async (req, res, next) => {
  try {
    await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subscriber removed.' });
  } catch (err) {
    next(err);
  }
};
