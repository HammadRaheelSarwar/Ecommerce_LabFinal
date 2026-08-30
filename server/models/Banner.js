const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String },
    image: {
      url: { type: String, required: true },
      cloudinaryId: { type: String },
    },
    mobileImage: {
      url: { type: String },
      cloudinaryId: { type: String },
    },
    buttonText: { type: String },
    buttonUrl: { type: String },
    location: {
      type: String,
      enum: ['hero', 'mid_page', 'category', 'sale', 'announcement'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    scheduledFrom: { type: Date },
    scheduledTo: { type: Date },
    sortOrder: { type: Number, default: 0 },
    textColor: { type: String, default: '#FFFFFF' },
    overlayOpacity: { type: Number, default: 0.4, min: 0, max: 1 },
  },
  { timestamps: true }
);

bannerSchema.index({ location: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
