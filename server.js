const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const FranchiseOpportunity = require("./models/FranchiseOpportunity");
const franchiseRoutes = require("./routes/franchiseRoutes");
const authRoutes = require("./routes/authRoutes");
const {createFranchisee} = require("./controllers/franchiseController");
const configs = require('./configs')
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/opportunities", franchiseRoutes);
app.use("/api/auth", authRoutes);

// Ensure uploads dir exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Upload full form with multiple files
app.post(
  "/api/submit-form",
  upload.fields([
    { name: "fddFile", maxCount: 1 },
    { name: "brandLogo", maxCount: 1 },
    { name: "brandBanner", maxCount: 1 },
    { name: "marketingBrochure", maxCount: 1 },
    { name: "galleryImages", maxCount: 5 }, // Allow multiple gallery images
  ]),
  createFranchisee
);

// Direct image upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const fileUrl = `${configs.IMAGE_BASE_URL}/${
    req.file.filename
  }`;
  res.status(200).json({ message: "Image uploaded", url: fileUrl });
});

//incase accidentally routed to the main server for images
app.use('/images/', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '10d', // Cache for 1 day
  etag: true,
  lastModified: true,
}));

// Health check
app.get("/", (req, res) => {
  res.send("📦 File Upload API is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
