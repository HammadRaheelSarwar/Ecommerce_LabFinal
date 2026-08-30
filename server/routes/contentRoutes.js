const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getHomepageSections, getHomepageSectionsAdmin, updateHomepageSection } = require('../controllers/contentController');
const adminAuth = require('../middleware/adminAuth');

router.get('/settings', getSettings);
router.put('/settings', adminAuth, updateSettings);

router.get('/homepage', getHomepageSections);
router.get('/homepage/admin', adminAuth, getHomepageSectionsAdmin);
router.put('/homepage/:sectionKey', adminAuth, updateHomepageSection);

module.exports = router;
