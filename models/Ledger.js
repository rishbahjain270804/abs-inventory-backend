const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  party_name: { type: String, required: true },
  party_type: { type: String, enum: ['Customer', 'Supplier'], default: 'Customer' },
  mobile_number: String,
  email: String,
  address: String,
  district_id: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  gst_number: String,
  opening_balance: { type: Number, default: 0 },
  balance_type: { type: String, enum: ['Debit', 'Credit'], default: 'Debit' }
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);
