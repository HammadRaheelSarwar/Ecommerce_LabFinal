const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

// POST /api/newsletter/subscribe  [public]
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('Email is required.', 400));

    const normalizedEmail = email.toLowerCase().trim();

    // Log subscription into activity_logs
    await supabase.from('activity_logs').insert({
      action: 'newsletter_subscription',
      admin_name: 'Customer',
      details: {
        email: normalizedEmail,
        source: req.body.source || 'homepage',
        subscribedAt: new Date().toISOString(),
      },
    });

    res.status(201).json({ success: true, message: 'Subscribed successfully. Welcome to All Available!' });
  } catch (err) {
    next(err);
  }
};

// GET /api/newsletter/subscribers  [adminAuth]
exports.getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('action', 'newsletter_subscription')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const subscribers = (data || []).map(d => ({
      _id: d.id,
      id: d.id,
      email: d.details?.email,
      source: d.details?.source,
      createdAt: d.created_at,
    }));

    res.json({
      success: true,
      subscribers,
      pagination: { page: Number(page), total: count || 0, pages: Math.ceil((count || 0) / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/newsletter/subscribers/:id  [adminAuth]
exports.deleteSubscriber = async (req, res, next) => {
  try {
    const { error } = await supabase.from('activity_logs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Subscriber removed.' });
  } catch (err) {
    next(err);
  }
};
