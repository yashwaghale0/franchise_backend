const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: [
      "admin",
      "franchisee",
      "franchisor",
      "customer",
      "Commercial real estate agent",
      "franchise broker",
      "Business broker",
      "franchise Attorney",
      "immigration attorney",
      "Other franchise service professional",
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
