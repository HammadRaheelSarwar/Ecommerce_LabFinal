const mongoose = require('mongoose');

const homepageSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'hero',
        'featured_collection',
        'watches',
        'perfumes',
        'jewelry',
        'sale_banner',
        'men_women_banner',
        'trending',
        'newsletter',
      ],
    },
    isActive: { type: Boolean, default: true },
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    image: {
      url: { type: String },
      cloudinaryId: { type: String },
    },
    secondaryImage: {
      url: { type: String },
      cloudinaryId: { type: String },
    },
    ctaText: { type: String },
    ctaUrl: { type: String },
    secondaryCtaText: { type: String },
    secondaryCtaUrl: { type: String },
    // Extra flexible data per section
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);
