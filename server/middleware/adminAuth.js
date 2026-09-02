const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['x-admin-authorization'] || req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'all_available_admin_jwt_super_secret_key_2026'
    );

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database client not initialized.' });
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, is_active')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !admin) {
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }

    if (!admin.is_active) {
      return res.status(401).json({ success: false, message: 'Admin account is deactivated.' });
    }

    req.admin = {
      _id: admin.id,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.is_active,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid admin token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Admin session expired.' });
    }
    next(err);
  }
};

module.exports = adminAuth;
