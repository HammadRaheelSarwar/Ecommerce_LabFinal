const express = require('express');
const router = express.Router();
const { adminLogin, getAdminMe, adminLogout, getActivityLogs } = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, adminLogin);
router.get('/me', adminAuth, getAdminMe);
router.post('/logout', adminLogout);
router.get('/logs', adminAuth, getActivityLogs);

module.exports = router;
