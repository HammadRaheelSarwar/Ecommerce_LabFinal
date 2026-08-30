const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

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

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return next(createError('An account with this email already exists.', 400));
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash: password, // pre-save hook hashes it
    });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user,
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

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return next(createError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(createError('Your account has been deactivated. Please contact support.', 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    // Remove passwordHash from output
    const userObj = user.toJSON();

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  // JWT is stateless; client deletes the token
  res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('Email is required.', 400));

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to avoid email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production, send email here via emailService
    // For dev, return token in response
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    console.log('Password reset URL (dev only):', resetUrl);

    res.json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return next(createError('Token and new password are required.', 400));
    }
    if (password.length < 6) {
      return next(createError('Password must be at least 6 characters.', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(createError('Invalid or expired reset token.', 400));
    }

    user.passwordHash = password; // pre-save hook hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = signToken(user._id);
    res.json({
      success: true,
      message: 'Password reset successfully.',
      token: jwtToken,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};
