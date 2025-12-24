const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qty_mt: { type: Number, default: 0 },
  qty_pcs: { type: Number, default: 0 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  ledger_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true },
  items: [orderItemSchema],
  total_amount: { type: Number, required: true },
  order_date: { type: Date, default: Date.now },
  delivery_date: Date,
  status: { type: String, enum: ['Pending', 'Dispatched'], default: 'Pending' },
  payment_status: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], default: 'Unpaid' },
  payment_method: { type: String, default: 'Pending' },
  paid_amount: { type: Number, default: 0 },
  balance_due: { type: Number, default: 0 },
  remarks: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
