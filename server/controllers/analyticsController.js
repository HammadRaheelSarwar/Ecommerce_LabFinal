const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

// GET /api/analytics/overview  [adminAuth]
exports.getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [
      ordersRes,
      todayOrdersRes,
      prodsCountRes,
      usersCountRes,
    ] = await Promise.all([
      supabase.from('orders').select('total_price, order_status'),
      supabase.from('orders').select('total_price, order_status').gte('created_at', todayStart),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ]);

    const orders = ordersRes.data || [];
    const todayOrders = todayOrdersRes.data || [];

    const totalRevenue = orders
      .filter(o => o.order_status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

    const todayRevenue = todayOrders
      .filter(o => o.order_status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

    const pendingOrders = orders.filter(o => ['placed', 'new', 'confirmed', 'pending'].includes(o.order_status)).length;

    res.json({
      success: true,
      data: {
        totalRevenue,
        todayRevenue,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalProducts: prodsCountRes.count || 0,
        lowStockProducts: 0,
        totalCustomers: usersCountRes.count || 0,
        pendingOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/revenue  [adminAuth]
exports.getRevenueChart = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_price, created_at, order_status')
      .gte('created_at', startDate.toISOString())
      .neq('order_status', 'cancelled');

    if (error) throw error;

    const dayMap = {};
    (orders || []).forEach(o => {
      const day = o.created_at?.slice(0, 10) || 'unknown';
      if (!dayMap[day]) dayMap[day] = { _id: day, revenue: 0, orders: 0 };
      dayMap[day].revenue += Number(o.total_price || 0);
      dayMap[day].orders += 1;
    });

    const data = Object.values(dayMap).sort((a, b) => a._id.localeCompare(b._id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/orders-by-status  [adminAuth]
exports.getOrdersByStatus = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('order_status');
    if (error) throw error;

    const counts = {};
    (orders || []).forEach(o => {
      const st = o.order_status || 'placed';
      counts[st] = (counts[st] || 0) + 1;
    });

    const data = Object.entries(counts).map(([_id, count]) => ({ _id, count }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/best-sellers  [adminAuth]
exports.getBestSellers = async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('name, slug, images, sold_count, rating, base_price, sale_price')
      .eq('is_active', true)
      .order('sold_count', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({
      success: true,
      products: (products || []).map(p => ({
        name: p.name,
        slug: p.slug,
        images: p.images || [],
        soldCount: p.sold_count || 0,
        rating: p.rating || 4.8,
        basePrice: p.base_price,
        salePrice: p.sale_price,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/customers  [adminAuth]
exports.getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = supabase.from('users').select('id, full_name, email, phone, role, is_active, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    res.json({
      success: true,
      customers: (data || []).map(c => ({
        _id: c.id,
        id: c.id,
        fullName: c.full_name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        isActive: c.is_active,
        createdAt: c.created_at,
        totalOrders: 0,
        totalSpent: 0,
      })),
      pagination: {
        page: Number(page),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/analytics/customers/:id/toggle  [adminAuth]
exports.toggleCustomerStatus = async (req, res, next) => {
  try {
    const { data: user, error: fetchErr } = await supabase.from('users').select('is_active').eq('id', req.params.id).single();
    if (fetchErr || !user) return next(createError('Customer not found.', 404));

    const { data: updated, error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', req.params.id)
      .select('is_active')
      .single();

    if (error) throw error;
    res.json({ success: true, message: `Customer ${updated.is_active ? 'activated' : 'deactivated'}.`, isActive: updated.is_active });
  } catch (err) {
    next(err);
  }
};
