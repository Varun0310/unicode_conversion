// models/Aadhaar.js
const mongoose = require('mongoose');

const AadhaarSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  aadhaarNumber: { type: String, required: true }, // store plain or masked
  frontImage: { type: Buffer, required: true },
  backImage: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Aadhaar', AadhaarSchema);
