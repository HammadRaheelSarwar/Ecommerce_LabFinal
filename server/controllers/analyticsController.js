const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');

// GET /api/analytics/overview  [adminAuth]
exports.getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrders,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      pendingOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ 'variants.stock': { $lte: 5, $gt: 0 } }),
      User.countDocuments({ isActive: true }),
      Order.countDocuments({ orderStatus: { $in: ['new', 'confirmed'] } }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalOrders,
        todayOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        pendingOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/revenue  [adminAuth] — last 30 days daily revenue
exports.getRevenueChart = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/orders-by-status  [adminAuth]
exports.getOrdersByStatus = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/best-sellers  [adminAuth]
exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(10)
      .select('name slug images soldCount rating basePrice')
      .lean();
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/customers  [adminAuth]
exports.getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-passwordHash').lean(),
      User.countDocuments(filter),
    ]);

    // Add order stats per customer
    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      { $match: { customer: { $in: customerIds }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: '$customer', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$grandTotal' }, lastOrder: { $max: '$createdAt' } } },
    ]);

    const statsMap = orderStats.reduce((acc, s) => { acc[s._id.toString()] = s; return acc; }, {});
    const enriched = customers.map((c) => ({
      ...c,
      ...(statsMap[c._id.toString()] || { totalOrders: 0, totalSpent: 0, lastOrder: null }),
    }));

    res.json({ success: true, customers: enriched, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/analytics/customers/:id/toggle  [adminAuth]
exports.toggleCustomerStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError('Customer not found.', 404));
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `Customer ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (err) {
    next(err);
  }
};
