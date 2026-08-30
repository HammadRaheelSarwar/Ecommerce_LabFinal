const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const ActivityLog = require('../models/ActivityLog');
const { createError } = require('../middleware/errorHandler');

const signAdminToken = (id) =>
  jwt.sign({ id }, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1d',
  });

// POST /api/admin/login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(createError('Email and password are required.', 400));

    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!admin || !(await admin.comparePassword(password))) {
      return next(createError('Invalid credentials.', 401));
    }
    if (!admin.isActive) {
      return next(createError('Admin account is deactivated.', 401));
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = signAdminToken(admin._id);
    res.json({ success: true, token, admin: admin.toJSON() });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/me  [adminAuth]
exports.getAdminMe = async (req, res, next) => {
  try {
    res.json({ success: true, admin: req.admin });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/logout
exports.adminLogout = (req, res) => {
  res.json({ success: true, message: 'Logged out.' });
};

// GET /api/admin/logs  [adminAuth]
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ActivityLog.countDocuments(),
    ]);
    res.json({ success: true, logs, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/log  (internal helper — can also be called directly)
exports.logActivity = async (adminId, action, entityType, entityId, metadata = {}) => {
  try {
    await ActivityLog.create({ action, entityType, entityId, performedBy: adminId, metadata });
  } catch (_) {
    // Non-critical — never let logging break request flow
  }
};
