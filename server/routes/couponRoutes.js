const express = require('express');
const router = express.Router();
const { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.post('/validate', auth, validateCoupon);

router.get('/', adminAuth, getCoupons);
router.post('/', adminAuth, createCoupon);
router.put('/:id', adminAuth, updateCoupon);
router.delete('/:id', adminAuth, deleteCoupon);

module.exports = router;
