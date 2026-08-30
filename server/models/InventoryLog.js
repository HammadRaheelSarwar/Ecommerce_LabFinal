const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    size: { type: String },
    color: { type: String },
    quantityChange: { type: Number, required: true }, // negative = decrease
    previousStock: { type: Number },
    newStock: { type: Number },
    reason: {
      type: String,
      enum: ['order_placed', 'order_cancelled', 'manual_adjustment', 'restock', 'return'],
      default: 'manual_adjustment',
    },
    orderId: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    note: { type: String },
  },
  { timestamps: true }
);

inventoryLogSchema.index({ product: 1 });
inventoryLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
