const express = require('express');
const router = express.Router();
const { getApprovedReviews, createReview, getAllReviewsAdmin, updateReview, deleteReview } = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/', getApprovedReviews);
router.post('/', auth, createReview);

router.get('/admin', adminAuth, getAllReviewsAdmin);
router.put('/:id', adminAuth, updateReview);
router.delete('/:id', adminAuth, deleteReview);

module.exports = router;
