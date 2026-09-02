const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

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

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return next(createError('Full name, email and password are required.', 400));
    }
    if (password.length < 6) {
      return next(createError('Password must be at least 6 characters.', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      return next(createError('An account with this email already exists.', 400));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        password_hash: passwordHash,
        role: 'customer',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Email and password are required.', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error || !user) {
      return next(createError('Invalid email or password.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return next(createError('Invalid email or password.', 401));
    }

    if (!user.is_active) {
      return next(createError('Your account has been deactivated. Please contact support.', 401));
    }

    const token = signToken(user.id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
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

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('Email is required.', 400));

    res.json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createError('Email and new password are required.', 400));
    }
    if (password.length < 6) {
      return next(createError('Password must be at least 6 characters.', 400));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())
      .select()
      .single();

    if (error || !user) return next(createError('User not found.', 404));

    const token = signToken(user.id);
    res.json({
      success: true,
      message: 'Password reset successfully.',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};
