const express = require('express');
const router = express.Router();
const {
  getCategories, getNavCategories, getCategoryBySlug,
  getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');
const adminAuth = require('../middleware/adminAuth');

// Public
router.get('/', getCategories);
router.get('/nav', getNavCategories);
router.get('/slug/:slug', getCategoryBySlug);

// Admin
router.get('/admin/all', adminAuth, getAllCategoriesAdmin);
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id', adminAuth, deleteCategory);

module.exports = router;
