const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  createOrder, getOrders, getOrderById, updateOrder, deleteOrder,
} = require('../controllers/orderController');
const adminAuth = require('../middleware/adminAuth');

// Optional auth: attaches req.user if token is present, but allows guests to order without login
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'all-available-secret-key-2026');
    req.user = decoded;
  } catch (_) {}
  next();
};

// Customer / Guest checkout — No mandatory login/signup!
router.post('/', optionalAuth, createOrder);

// Admin
router.get('/', adminAuth, getOrders);
router.get('/:id', adminAuth, getOrderById);
router.put('/:id', adminAuth, updateOrder);
router.delete('/:id', adminAuth, deleteOrder);

module.exports = router;
