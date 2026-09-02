const supabase = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

function formatReview(r) {
  if (!r) return null;
  return {
    _id: r.id,
    id: r.id,
    product: r.product_id,
    productId: r.product_id,
    customer: r.user_id,
    userId: r.user_id,
    name: r.user_name,
    rating: Number(r.rating || 5),
    comment: r.comment,
    status: r.is_approved ? 'approved' : 'pending',
    isApproved: r.is_approved,
    createdAt: r.created_at,
  };
}

// GET /api/reviews?product=slug  [public]
exports.getApprovedReviews = async (req, res, next) => {
  try {
    const { product: productSlug, page = 1, limit = 10 } = req.query;
    let query = supabase.from('reviews').select('*', { count: 'exact' }).eq('is_approved', true);

    if (productSlug) {
      const { data: prod } = await supabase
        .from('products')
        .select('id')
        .eq('slug', productSlug)
        .maybeSingle();

      if (prod) {
        query = query.eq('product_id', prod.id);
      }
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      reviews: (data || []).map(formatReview),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews  [auth]
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return next(createError('Product, rating and comment are required.', 400));
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: req.user?.id || null,
        user_name: req.user?.fullName || 'Customer',
        rating: Number(rating),
        comment,
        is_approved: true, // Auto approve for instant storefront display
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: formatReview(review),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/admin  [adminAuth]
exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await supabase
      .from('reviews')
      .select('*, product:products(id, name, slug)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      reviews: (data || []).map(formatReview),
      pagination: {
        page: Number(page),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/reviews/:id  [adminAuth]
exports.updateReview = async (req, res, next) => {
  try {
    const isApproved = req.body.status === 'approved' || req.body.isApproved === true;
    const { data: review, error } = await supabase
      .from('reviews')
      .update({ is_approved: isApproved })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !review) return next(createError('Review not found.', 404));

    res.json({ success: true, message: `Review updated.`, review: formatReview(review) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id  [adminAuth]
exports.deleteReview = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};
