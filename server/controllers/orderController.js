const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

// Generate readable order ID
const generateOrderId = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `AA-${datePart}-${randPart}`;
};

// POST /api/orders  [auth required]
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod', customerNotes, couponCode } = req.body;

    if (!items || items.length === 0) {
      return next(createError('Order must have at least one item.', 400));
    }

    // Build order items with snapshots + validate stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return next(createError(`Product "${item.name || item.productId}" is not available.`, 400));
      }

      // Check stock for specific variant
      if (item.size || item.color) {
        const variant = product.variants.find(
          (v) => v.size === item.size && v.color === item.color && v.isActive
        );
        if (variant && variant.stock < item.quantity) {
          return next(createError(`Insufficient stock for ${product.name} (${item.size}/${item.color}).`, 400));
        }
      }

      const mainImage = product.images.find((img) => img.isMain) || product.images[0];
      const unitPrice = product.salePrice || product.basePrice;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: item.sku || product.sku || '',
        image: mainImage?.url || '',
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let couponData = {};
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        const isValid =
          (!coupon.startDate || coupon.startDate <= now) &&
          (!coupon.expiryDate || coupon.expiryDate >= now) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          subtotal >= (coupon.minOrderAmount || 0);

        if (isValid) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
          } else {
            discount = Math.min(coupon.discountValue, subtotal);
          }
          couponData = { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue };
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Shipping cost
    const settings = await require('../models/WebsiteSettings').findOne().lean();
    const freeThreshold = settings?.shipping?.freeShippingThreshold || 5000;
    const stdShipping = settings?.shipping?.standardShippingCost || 200;
    const shippingCost = subtotal >= freeThreshold ? 0 : stdShipping;

    const grandTotal = Math.max(0, subtotal - discount + shippingCost);

    const order = await Order.create({
      orderId: generateOrderId(),
      customer: req.user._id, // from auth middleware — never trust frontend
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      discount,
      grandTotal,
      coupon: couponData,
      paymentMethod,
      customerNotes,
      statusHistory: [{ status: 'new', note: 'Order placed by customer.' }],
    });

    // Deduct stock for each variant
    for (const item of items) {
      if (item.size || item.color) {
        await Product.updateOne(
          { _id: item.productId, 'variants.size': item.size, 'variants.color': item.color },
          { $inc: { 'variants.$.stock': -item.quantity, soldCount: item.quantity } }
        );
      } else {
        await Product.updateOne({ _id: item.productId }, { $inc: { soldCount: item.quantity } });
      }
    }

    // Clear user's server-side cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders  [adminAuth]
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search, from, to } = req.query;
    const filter = {};

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.$or = [{ orderId: new RegExp(search, 'i') }];
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id  [adminAuth]
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'fullName email phone');
    if (!order) return next(createError('Order not found.', 404));
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id  [adminAuth]
exports.updateOrder = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError('Order not found.', 404));

    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.statusHistory.push({ status: orderStatus, note: adminNotes || '', changedBy: req.admin._id });
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (adminNotes) order.adminNotes = adminNotes;

    await order.save();
    res.json({ success: true, message: 'Order updated.', order });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id  [adminAuth]
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return next(createError('Order not found.', 404));
    res.json({ success: true, message: 'Order deleted.' });
  } catch (err) {
    next(err);
  }
};
