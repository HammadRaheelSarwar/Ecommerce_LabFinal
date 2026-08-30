const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers, deleteSubscriber } = require('../controllers/newsletterController');
const adminAuth = require('../middleware/adminAuth');

router.post('/subscribe', subscribe);
router.get('/subscribers', adminAuth, getSubscribers);
router.delete('/subscribers/:id', adminAuth, deleteSubscriber);

module.exports = router;
