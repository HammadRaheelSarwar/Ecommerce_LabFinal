const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

function formatCoupon(c) {
  if (!c) return null;
  return {
    _id: c.id,
    id: c.id,
    code: c.code,
    discountType: c.discount_type,
    discountValue: Number(c.discount_value || 0),
    minOrderAmount: Number(c.min_order_amount || 0),
    maxDiscountAmount: c.max_discount_amount ? Number(c.max_discount_amount) : null,
    startDate: c.start_date,
    expiryDate: c.expiry_date,
    usageLimit: c.usage_limit,
    usedCount: c.used_count || 0,
    isActive: c.is_active,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

// POST /api/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return next(createError('Coupon code is required.', 400));

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) return next(createError('Invalid coupon code.', 404));

    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return next(createError('This coupon is not yet active.', 400));
    }
    if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
      return next(createError('This coupon has expired.', 400));
    }
    if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
      return next(createError('This coupon has reached its usage limit.', 400));
    }
    if (orderTotal < (coupon.min_order_amount || 0)) {
      return next(createError(`Minimum order of Rs. ${coupon.min_order_amount} required for this coupon.`, 400));
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      discountAmount = Math.min(coupon.discount_value, orderTotal);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
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
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, coupons: (data || []).map(formatCoupon) });
  } catch (err) {
    next(err);
  }
};

// POST /api/coupons  [adminAuth]
exports.createCoupon = async (req, res, next) => {
  try {
    const payload = {
      code: req.body.code?.toUpperCase().trim(),
      discount_type: req.body.discountType || 'percentage',
      discount_value: req.body.discountValue,
      min_order_amount: req.body.minOrderAmount || 0,
      max_discount_amount: req.body.maxDiscountAmount || null,
      start_date: req.body.startDate || null,
      expiry_date: req.body.expiryDate || null,
      usage_limit: req.body.usageLimit || null,
      is_active: req.body.isActive !== false,
    };

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Coupon created.', coupon: formatCoupon(coupon) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/coupons/:id  [adminAuth]
exports.updateCoupon = async (req, res, next) => {
  try {
    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (req.body.code) updates.code = req.body.code.toUpperCase().trim();
    if (req.body.discountType) updates.discount_type = req.body.discountType;
    if (req.body.discountValue !== undefined) updates.discount_value = req.body.discountValue;
    if (req.body.minOrderAmount !== undefined) updates.min_order_amount = req.body.minOrderAmount;
    if (req.body.maxDiscountAmount !== undefined) updates.max_discount_amount = req.body.maxDiscountAmount;
    if (req.body.startDate !== undefined) updates.start_date = req.body.startDate;
    if (req.body.expiryDate !== undefined) updates.expiry_date = req.body.expiryDate;
    if (req.body.usageLimit !== undefined) updates.usage_limit = req.body.usageLimit;
    if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !coupon) return next(createError('Coupon not found.', 404));
    res.json({ success: true, message: 'Coupon updated.', coupon: formatCoupon(coupon) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/coupons/:id  [adminAuth]
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    next(err);
  }
};
