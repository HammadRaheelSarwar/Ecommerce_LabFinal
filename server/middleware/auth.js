const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database client not initialized.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role, is_active, cart, wishlist, addresses')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    }

    req.user = {
      _id: user.id,
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      addresses: user.addresses || [],
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    next(err);
  }
};

module.exports = auth;
