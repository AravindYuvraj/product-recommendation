const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    unique: true
  },
  product_name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity_in_stock: {
    type: Number,
    default: 0
  },
  manufacturer: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  weight: {
    type: Number
  },
  dimensions: {
    type: String
  },
  release_date: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_on_sale: {
    type: Boolean,
    default: false
  },
  sale_price: {
    type: Number
  },
  image_url: {
    type: String
  },
  view_count: {
    type: Number,
    default: 0
  },
  purchase_count: {
    type: Number,
    default: 0
  },
  like_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ product_name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
