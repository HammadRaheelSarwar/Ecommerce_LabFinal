const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

function formatUser(u) {
  if (!u) return null;
  return {
    _id: u.id,
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    role: u.role || 'customer',
    isActive: u.is_active,
    cart: u.cart || [],
    wishlist: u.wishlist || [],
    addresses: u.addresses || [],
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

// GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error || !user) return next(createError('User not found.', 404));
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (fullName) updates.full_name = fullName.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Profile updated.', user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ success: true, addresses: user?.addresses || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, country, city, area, address, postalCode, isDefault } = req.body;
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', req.user.id)
      .single();
    if (fetchErr) throw fetchErr;

    let addresses = user?.addresses || [];
    if (isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }

    const newAddress = {
      id: Date.now().toString(),
      label: label || 'Home',
      fullName,
      phone,
      country: country || 'Pakistan',
      city,
      area,
      address,
      postalCode,
      isDefault: !!isDefault,
    };
    addresses.push(newAddress);

    const { error: updateErr } = await supabase
      .from('users')
      .update({ addresses, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (updateErr) throw updateErr;
    res.status(201).json({ success: true, message: 'Address added.', addresses });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/addresses/:id
exports.updateAddress = async (req, res, next) => {
  try {
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', req.user.id)
      .single();
    if (fetchErr) throw fetchErr;

    let addresses = user?.addresses || [];
    const index = addresses.findIndex(a => (a.id === req.params.id || a._id === req.params.id));
    if (index === -1) return next(createError('Address not found.', 404));

    if (req.body.isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }

    addresses[index] = { ...addresses[index], ...req.body };

    const { error: updateErr } = await supabase
      .from('users')
      .update({ addresses, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (updateErr) throw updateErr;
    res.json({ success: true, message: 'Address updated.', addresses });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', req.user.id)
      .single();
    if (fetchErr) throw fetchErr;

    let addresses = (user?.addresses || []).filter(a => a.id !== req.params.id && a._id !== req.params.id);

    const { error: updateErr } = await supabase
      .from('users')
      .update({ addresses, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (updateErr) throw updateErr;
    res.json({ success: true, message: 'Address removed.', addresses });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: orders, count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({
      success: true,
      orders: orders || [],
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

// GET /api/users/orders/:id
exports.getMyOrderById = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error || !order) return next(createError('Order not found.', 404));
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/cart
exports.getCart = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('cart')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ success: true, cart: user?.cart || [] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/cart/sync
exports.syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('cart')
      .eq('id', req.user.id)
      .single();
    if (fetchErr) throw fetchErr;

    let cart = user?.cart || [];
    items.forEach((incoming) => {
      const existing = cart.find(
        (c) =>
          (c.productId === incoming.productId || c.product === incoming.productId) &&
          c.size === incoming.size &&
          c.color === incoming.color
      );
      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        cart.push(incoming);
      }
    });

    const { error } = await supabase
      .from('users')
      .update({ cart, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);
    if (error) throw error;

    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/cart/replace
exports.replaceCart = async (req, res, next) => {
  try {
    const { cart = [] } = req.body;
    const { error } = await supabase
      .from('users')
      .update({ cart, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);
    if (error) throw error;
    res.json({ success: true, message: 'Cart updated.', cart });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('wishlist')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ success: true, wishlist: user?.wishlist || [] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/wishlist/sync
exports.syncWishlist = async (req, res, next) => {
  try {
    const { productIds = [] } = req.body;
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('wishlist')
      .eq('id', req.user.id)
      .single();
    if (fetchErr) throw fetchErr;

    let wishlist = user?.wishlist || [];
    productIds.forEach((id) => {
      if (!wishlist.includes(id)) wishlist.push(id);
    });

    const { error } = await supabase
      .from('users')
      .update({ wishlist, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);
    if (error) throw error;

    res.json({ success: true, wishlist });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/wishlist/:productId (toggle)
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('wishlist')
      .eq('id', req.user.id)
      .single();
    if (fetchErr) throw fetchErr;

    let wishlist = user?.wishlist || [];
    let inWishlist = false;

    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
      inWishlist = false;
    } else {
      wishlist.push(productId);
      inWishlist = true;
    }

    const { error } = await supabase
      .from('users')
      .update({ wishlist, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);
    if (error) throw error;

    res.json({
      success: true,
      inWishlist,
      message: inWishlist ? 'Added to wishlist.' : 'Removed from wishlist.',
      wishlist,
    });
  } catch (err) {
    next(err);
  }
};
