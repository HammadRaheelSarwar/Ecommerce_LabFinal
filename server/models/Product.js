const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: { type: String, trim: true },
  size: { type: String, trim: true },
  color: { type: String, trim: true },
  stock: { type: Number, default: 0, min: 0 },
  lowStockAlert: { type: Number, default: 5 },
  price: { type: Number },       // override base price if needed
  salePrice: { type: Number },   // override sale price if needed
  image: { type: String },       // variant-specific image URL
  isActive: { type: Boolean, default: true },
}, { _id: true });

const productImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  cloudinaryId: { type: String },
  isMain: { type: Boolean, default: false },
  isHover: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { _id: true });

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, trim: true },
    description: { type: String },
    shortDescription: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, trim: true },
    brand: { type: String, trim: true },
    gender: { type: String, enum: ['men', 'women', 'unisex', 'kids', ''], default: '' },
    material: { type: String, trim: true },
    tags: [{ type: String, trim: true }],

    // Pricing
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    discountPercentage: { type: Number, min: 0, max: 100 },

    // Variants (size × color × stock)
    variants: [variantSchema],

    // Images
    images: [productImageSchema],

    // Flags
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Aggregated stats (updated by review/order events)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    // SEO
    seoTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// Indexes for fast queries
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, isNewArrival: 1 });
productSchema.index({ isActive: 1, isBestSeller: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
