const express = require('express');
const router = express.Router();
const { getActiveBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const adminAuth = require('../middleware/adminAuth');

router.get('/', getActiveBanners);
router.get('/admin', adminAuth, getAllBannersAdmin);
router.post('/', adminAuth, createBanner);
router.put('/:id', adminAuth, updateBanner);
router.delete('/:id', adminAuth, deleteBanner);

module.exports = router;
