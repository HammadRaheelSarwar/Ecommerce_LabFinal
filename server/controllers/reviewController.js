const Review = require('../models/Review');
const Product = require('../models/Product');
const { createError } = require('../middleware/errorHandler');

// GET /api/reviews?product=slug  [public]
exports.getApprovedReviews = async (req, res, next) => {
  try {
    const { product: productSlug, page = 1, limit = 10 } = req.query;
    const filter = { status: 'approved' };

    if (productSlug) {
      const prod = await Product.findOne({ slug: productSlug }).select('_id');
      if (!prod) return next(createError('Product not found.', 404));
      filter.product = prod._id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews  [auth — customer submits]
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return next(createError('Product, rating and comment are required.', 400));
    }

    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      rating,
      comment,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Review submitted and pending approval.', review });
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/admin  [adminAuth]
exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('product', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({ success: true, reviews, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/reviews/:id  [adminAuth]
exports.updateReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return next(createError('Review not found.', 404));

    // If approved, update product rating
    if (status === 'approved') {
      const approvedReviews = await Review.find({ product: review.product, status: 'approved' });
      const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      await Product.findByIdAndUpdate(review.product, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: approvedReviews.length,
      });
    }

    res.json({ success: true, message: `Review ${status}.`, review });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id  [adminAuth]
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return next(createError('Review not found.', 404));
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};
