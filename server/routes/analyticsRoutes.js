const express = require('express');
const router = express.Router();
const { getOverview, getRevenueChart, getOrdersByStatus, getBestSellers, getCustomers, toggleCustomerStatus } = require('../controllers/analyticsController');
const adminAuth = require('../middleware/adminAuth');

router.use(adminAuth);

router.get('/overview', getOverview);
router.get('/revenue', getRevenueChart);
router.get('/orders-by-status', getOrdersByStatus);
router.get('/best-sellers', getBestSellers);
router.get('/customers', getCustomers);
router.put('/customers/:id/toggle', toggleCustomerStatus);

module.exports = router;
