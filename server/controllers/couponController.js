const Coupon = require('../models/Coupon');
const { createError } = require('../middleware/errorHandler');

// POST /api/coupons/validate  [auth]
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return next(createError('Coupon code is required.', 400));

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) return next(createError('Invalid coupon code.', 404));

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return next(createError('This coupon is not yet active.', 400));
    }
    if (coupon.expiryDate && coupon.expiryDate < now) {
      return next(createError('This coupon has expired.', 400));
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(createError('This coupon has reached its usage limit.', 400));
    }
    if (orderTotal < (coupon.minOrderAmount || 0)) {
      return next(createError(`Minimum order of Rs. ${coupon.minOrderAmount} required for this coupon.`, 400));
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    } else {
      discountAmount = Math.min(coupon.discountValue, orderTotal);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/coupons  [adminAuth]
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

// POST /api/coupons  [adminAuth]
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code?.toUpperCase() });
    res.status(201).json({ success: true, message: 'Coupon created.', coupon });
  } catch (err) {
    next(err);
  }
};

// PUT /api/coupons/:id  [adminAuth]
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return next(createError('Coupon not found.', 404));
    res.json({ success: true, message: 'Coupon updated.', coupon });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/coupons/:id  [adminAuth]
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(createError('Coupon not found.', 404));
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    next(err);
  }
};
