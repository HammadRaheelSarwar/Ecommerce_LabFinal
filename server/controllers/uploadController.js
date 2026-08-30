const path = require('path');
const { isConfigured, cloudinary } = require('../config/cloudinary');

// POST /api/upload  [adminAuth]
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    let url, cloudinaryId;

    if (isConfigured && req.file.path) {
      // Cloudinary — multer-storage-cloudinary sets path = secure_url
      url = req.file.path;
      cloudinaryId = req.file.filename;
    } else {
      // Local fallback
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      url = `${baseUrl}/uploads/${req.file.filename}`;
      cloudinaryId = null;
    }

    res.json({ success: true, url, cloudinaryId });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/upload  [adminAuth]
exports.deleteImage = async (req, res, next) => {
  try {
    const { cloudinaryId } = req.body;
    if (!cloudinaryId) {
      return res.status(400).json({ success: false, message: 'cloudinaryId is required.' });
    }
    if (isConfigured) {
      await cloudinary.uploader.destroy(cloudinaryId);
    }
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    next(err);
  }
};
