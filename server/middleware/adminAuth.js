const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const supabase = require('../config/supabase');

const mongoose = require('mongoose');

const isSupabaseConfigured = () => {
  return !!supabase;
};

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['x-admin-authorization'] || req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'all_available_admin_jwt_super_secret_key_2026');

    // 1. Try Supabase if configured
    if (isSupabaseConfigured()) {
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('id, name, email, role, is_active')
        .eq('id', decoded.id)
        .maybeSingle();

      if (admin) {
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
        return next();
      }
    }

    // 2. Fall back to MongoDB if connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }

    const admin = await AdminUser.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }
    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account is deactivated.' });
    }

    req.admin = admin;
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
