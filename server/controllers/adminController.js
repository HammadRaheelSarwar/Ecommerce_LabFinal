const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const signAdminToken = (id) =>
  jwt.sign({ id }, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'all_available_admin_jwt_super_secret_key_2026', {
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1d',
  });

// POST /api/admin/login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(createError('Email and password are required.', 400));

    const normalizedEmail = email.toLowerCase().trim();

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error || !admin || !admin.password_hash) {
      return next(createError('Invalid credentials.', 401));
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return next(createError('Invalid credentials.', 401));
    }
    if (!admin.is_active) {
      return next(createError('Admin account is deactivated.', 401));
    }

    const token = signAdminToken(admin.id);
    const adminData = {
      _id: admin.id,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.is_active,
      lastLogin: new Date().toISOString(),
    };

    return res.json({ success: true, token, admin: adminData });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/me
exports.getAdminMe = async (req, res, next) => {
  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, is_active, created_at')
      .eq('id', req.admin.id)
      .single();

    if (error || !admin) return next(createError('Admin not found.', 404));

    res.json({
      success: true,
      admin: {
        _id: admin.id,
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active,
        createdAt: admin.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/admins
exports.getAllAdmins = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({
      success: true,
      admins: (data || []).map(a => ({
        _id: a.id,
        id: a.id,
        name: a.name,
        email: a.email,
        role: a.role,
        isActive: a.is_active,
        createdAt: a.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/admins
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff' } = req.body;
    if (!name || !email || !password) {
      return next(createError('Name, email and password are required.', 400));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        is_active: true,
      })
      .select('id, name, email, role, is_active, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Admin account created.',
      admin: {
        _id: admin.id,
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/admins/:id/toggle
exports.toggleAdminStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.admin.id) {
      return next(createError('Cannot deactivate your own account.', 400));
    }

    const { data: existing } = await supabase.from('admin_users').select('is_active').eq('id', req.params.id).single();
    if (!existing) return next(createError('Admin not found.', 404));

    const { data: admin, error } = await supabase
      .from('admin_users')
      .update({ is_active: !existing.is_active })
      .eq('id', req.params.id)
      .select('id, is_active')
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Admin status updated.', isActive: admin.is_active });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/logout
exports.adminLogout = (req, res) => {
  res.json({ success: true, message: 'Admin logged out successfully.' });
};

// GET /api/admin/logs  [adminAuth]
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: logs, count, error } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({
      success: true,
      logs: logs || [],
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
