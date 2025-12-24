const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  district_name: { type: String, required: true },
  state: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('District', districtSchema);
