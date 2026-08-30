const User = require('../models/User');
const Order = require('../models/Order');
const { createError } = require('../middleware/errorHandler');

// GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, profileImage },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, country, city, area, address, postalCode, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({ label, fullName, phone, country, city, area, address, postalCode, isDefault });
    await user.save();

    res.status(201).json({ success: true, message: 'Address added.', addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/addresses/:id
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return next(createError('Address not found.', 404));

    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(addr, req.body);
    await user.save();

    res.json({ success: true, message: 'Address updated.', addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return next(createError('Address not found.', 404));

    addr.deleteOne();
    await user.save();

    res.json({ success: true, message: 'Address removed.', addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments({ customer: req.user._id }),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/orders/:id
exports.getMyOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return next(createError('Order not found.', 404));
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/cart
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('cart').populate('cart.product', 'name images basePrice salePrice isActive');
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/cart  (merge/sync — receives full cart array from client)
exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body; // array of { productId, size, color, quantity, price, name, image }
    const user = await User.findById(req.user._id);

    // Merge: for each incoming item, find matching variant in server cart
    items.forEach((incoming) => {
      const existing = user.cart.find(
        (c) =>
          c.product.toString() === incoming.productId &&
          c.size === incoming.size &&
          c.color === incoming.color
      );
      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        user.cart.push({
          product: incoming.productId,
          name: incoming.name,
          image: incoming.image,
          size: incoming.size,
          color: incoming.color,
          quantity: incoming.quantity,
          price: incoming.price,
        });
      }
    });

    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/cart/replace (replace full cart after checkout / explicit update)
exports.replaceCart = async (req, res, next) => {
  try {
    const { cart } = req.body;
    await User.findByIdAndUpdate(req.user._id, { cart });
    res.json({ success: true, message: 'Cart updated.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('wishlist').populate('wishlist.product', 'name images basePrice salePrice slug');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/wishlist (merge guest wishlist on login)
exports.syncWishlist = async (req, res, next) => {
  try {
    const { productIds } = req.body; // array of product IDs from localStorage
    const user = await User.findById(req.user._id);

    productIds.forEach((id) => {
      const exists = user.wishlist.some((w) => w.product.toString() === id);
      if (!exists) user.wishlist.push({ product: id });
    });

    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/wishlist/:productId  (toggle)
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex((w) => w.product.toString() === req.params.productId);

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      await user.save();
      return res.json({ success: true, inWishlist: false, message: 'Removed from wishlist.' });
    } else {
      user.wishlist.push({ product: req.params.productId });
      await user.save();
      return res.json({ success: true, inWishlist: true, message: 'Added to wishlist.' });
    }
  } catch (err) {
    next(err);
  }
};
