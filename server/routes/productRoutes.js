const express = require('express');
const router = express.Router();
const {
  getProducts, getProductBySlug, getProductById, getSimilarProducts,
  createProduct, updateProduct, deleteProduct, duplicateProduct,
  getAllProductsAdmin,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug/similar', getSimilarProducts);
router.get('/id/:slugOrId/similar', getSimilarProducts);
router.get('/:slugOrId/similar', getSimilarProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/id/:id', getProductById);

// Admin routes
router.get('/admin/all', adminAuth, getAllProductsAdmin);
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);
router.post('/:id/duplicate', adminAuth, duplicateProduct);

module.exports = router;
