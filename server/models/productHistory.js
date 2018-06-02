const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductHistorySchema = new Schema({
  name: {
    type: String,
  },
  category: {
    type: String,
  },
  price: {
    type: Number,
  },
  stock: {
    type: Number,
    // Don't allow float
    get: v => Math.round(v),
    set: v => Math.round(v),
  },
  oldStock: {
    type: Number,
    // Don't allow float
    get: v => Math.round(v),
    set: v => Math.round(v),
  },    
  sku: {
    type: String,
  },
  reason: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default() {
      return Date.now();
    },
    required: true,
  },
});

module.exports = mongoose.model('ProductHistory', ProductHistorySchema);
