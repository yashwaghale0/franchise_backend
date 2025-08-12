// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // note: minimal payload; use verifyToken to attach full user
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) return res.status(404).json({ message: "User not found" });
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

const isAdmin = (req, res, next) => {
  // adjust role name check if your role names differ
  if (
    req.user &&
    (req.user.role === "Super Admin" || req.user.role === "admin")
  ) {
    return next();
  }
  return res.status(403).json({ message: "Not authorized as admin" });
};

module.exports = { protect, verifyToken, isAdmin };
