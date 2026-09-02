const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

// Generate readable order ID
const generateOrderId = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `AA-${datePart}-${randPart}`;
};

function formatOrder(o) {
  if (!o) return null;
  return {
    _id: o.id,
    id: o.id,
    orderNumber: o.order_number,
    user: o.user_id,
    guestInfo: o.guest_info,
    items: o.items || [],
    shippingAddress: o.shipping_address || {},
    subtotal: Number(o.subtotal || 0),
    shippingCost: Number(o.shipping_cost || 0),
    discountAmount: Number(o.discount_amount || 0),
    totalPrice: Number(o.total_price || 0),
    grandTotal: Number(o.total_price || 0),
    paymentMethod: o.payment_method || 'cod',
    paymentStatus: o.payment_status || 'pending',
    orderStatus: o.order_status || 'placed',
    trackingNumber: o.tracking_number,
    notes: o.notes,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod', customerNotes, couponCode, guestInfo } = req.body;

    if (!items || items.length === 0) {
      return next(createError('Order must have at least one item.', 400));
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const prodId = item.productId || item.product || item._id;
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', prodId)
        .maybeSingle();

      const unitPrice = product ? (product.sale_price || product.base_price) : (item.price || item.unitPrice || 1000);
      const totalPrice = unitPrice * (item.quantity || 1);
      subtotal += totalPrice;

      orderItems.push({
        product: prodId,
        productId: prodId,
        name: product?.name || item.name || 'Product',
        sku: item.sku || product?.sku || '',
        image: item.image || product?.images?.[0]?.url || '',
        size: item.size || 'Unstitched',
        color: item.color || 'Original',
        quantity: item.quantity || 1,
        unitPrice,
        totalPrice,
      });
    }

    let discount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (coupon) {
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100;
        } else {
          discount = Math.min(coupon.discount_value, subtotal);
        }
      }
    }

    const shippingCost = subtotal >= 5000 ? 0 : 200;
    const totalPrice = Math.max(0, subtotal - discount + shippingCost);
    const orderNumber = generateOrderId();

    const orderPayload = {
      order_number: orderNumber,
      user_id: req.user?.id || null,
      guest_info: guestInfo || (req.user ? null : shippingAddress),
      items: orderItems,
      shipping_address: shippingAddress,
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discount,
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_status: 'pending',
      order_status: 'placed',
      notes: customerNotes,
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: formatOrder(order),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my-orders  [auth]
exports.getMyOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, orders: (orders || []).map(formatOrder) });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/track/:orderNumber  [public]
exports.trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim())
      .maybeSingle();

    if (error || !order) return next(createError('Order not found.', 404));
    res.json({ success: true, order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/admin  [adminAuth]
exports.getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (status) query = query.eq('order_status', status);
    if (search) query = query.ilike('order_number', `%${search}%`);

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      orders: (data || []).map(formatOrder),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/admin/:id/status  [adminAuth]
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (status) updates.order_status = status;
    if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
    if (notes !== undefined) updates.notes = notes;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) return next(createError('Order not found.', 404));

    res.json({ success: true, message: 'Order status updated.', order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id  [adminAuth]
exports.deleteOrder = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id  [adminAuth]
exports.getOrderById = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !order) return next(createError('Order not found.', 404));
    res.json({ success: true, order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
};
exports.getOrderByIdAdmin = exports.getOrderById;

// Aliases matching orderRoutes.js
exports.getOrders = exports.getAllOrdersAdmin;
exports.updateOrder = exports.updateOrderStatus;
