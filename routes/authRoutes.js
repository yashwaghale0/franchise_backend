const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  loginUser,
  signUp,
  getAllUsers,
} = require("../controllers/authController");
const { protect, verifyToken, isAdmin } = require("../middleware/auth");
const User = require("../models/User");
const {
  createUserByAdmin,
  updateMyProfile,
  updateUserByAdmin,
} = require("../controllers/userController");
const sendEmail = require("../utils/sendEmail");
const { savePersonalDetails } = require("../controllers/userController");

const router = express.Router();

router.post("/personal-details", protect, savePersonalDetails);

// Auth routes
router.post("/register", signUp);
router.post("/login", loginUser);

// Fetch all users
router.get("/users", getAllUsers);

// Admin/User routes
// router.post("/create", verifyToken, isAdmin, createUserByAdmin);
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

router.post("/personal-details", verifyToken, async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;

    // Save details to DB (example with Mongoose)
    const userId = req.user.id; // From verifyToken
    await User.findByIdAndUpdate(userId, {
      fullName,
      phone,
      address,
    });

    res.status(200).json({ message: "Personal details saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
