const rateLimit = require('express-rate-limit');

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

// Search limiter
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: { success: false, message: 'Too many search requests.' },
});

module.exports = { generalLimiter, authLimiter, searchLimiter };
