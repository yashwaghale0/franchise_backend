const express = require("express");
const { loginUser, signUp } = require("../controllers/authController");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register a new user

router.post("/register", signUp);

router.post("/login", loginUser);

module.exports = router;
