const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  item_code: String,
  hsn_code: String,
  gst_rate: { type: Number, default: 0 },
  unit: { type: String, default: 'PCS' },
  opening_stock: { type: Number, default: 0 },
  opening_value: { type: Number, default: 0 },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
