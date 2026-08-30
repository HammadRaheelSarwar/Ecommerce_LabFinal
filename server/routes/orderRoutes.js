const express = require('express');
const router = express.Router();
const {
  createOrder, getOrders, getOrderById, updateOrder, deleteOrder,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Customer — must be authenticated
router.post('/', auth, createOrder);

// Admin
router.get('/', adminAuth, getOrders);
router.get('/:id', adminAuth, getOrderById);
router.put('/:id', adminAuth, updateOrder);
router.delete('/:id', adminAuth, deleteOrder);

module.exports = router;
