const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile,
  getAddresses, addAddress, updateAddress, deleteAddress,
  getMyOrders, getMyOrderById,
  getCart, syncCart, replaceCart,
  getWishlist, syncWishlist, toggleWishlist,
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes require authentication
router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

router.get('/orders', getMyOrders);
router.get('/orders/:id', getMyOrderById);

router.get('/cart', getCart);
router.put('/cart/sync', syncCart);
router.put('/cart/replace', replaceCart);

router.get('/wishlist', getWishlist);
router.put('/wishlist/sync', syncWishlist);
router.post('/wishlist/:productId', toggleWishlist);

module.exports = router;
