const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

router.post('/', adminAuth, upload.single('image'), uploadImage);
router.delete('/', adminAuth, deleteImage);

module.exports = router;
