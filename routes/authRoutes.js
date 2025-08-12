const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { loginUser, signUp } = require("../controllers/authController");
const { protect, verifyToken, isAdmin } = require("../middleware/auth");
const User = require("../models/User");
const {
  createUserByAdmin,
  updateMyProfile,
  updateUserByAdmin,
} = require("../controllers/userController");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// Auth routes
router.post("/register", signUp);
router.post("/login", loginUser);

// Admin/User routes
router.post("/create", verifyToken, isAdmin, createUserByAdmin);
router.patch("/me", verifyToken, updateMyProfile);
router.patch("/:id", verifyToken, isAdmin, updateUserByAdmin);

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Your Password",
      `Click the link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`
    );

    res.status(200).json({ msg: "Password reset link sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ msg: "Password reset successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
