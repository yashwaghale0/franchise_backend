// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "Super Admin",
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
      default: "customer", // default so sign-ups can omit role
    },

    // optional profile fields from your form:
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String },
    company: { type: String },
    brandName: { type: String },
    calendlyUrl: { type: String },
    membershipType: { type: String },
    issuanceDate: { type: Date },

    // password reset / temp password flags
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    requirePasswordChange: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
