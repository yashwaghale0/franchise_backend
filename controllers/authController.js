const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    //Generate a JWT token on signup
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ token, message: "User Registered successfully" });
  } catch (error) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
