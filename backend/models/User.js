const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  onboardingStep: {
    type: String,
    enum: ["customer", "finance", "aadhaar", "done"],
    default: "customer",
  },
});

module.exports = mongoose.model("User", UserSchema);
