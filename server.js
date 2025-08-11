const slugify = require("slugify");
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

const app = express();
const PORT = process.env.PORT || 5000;

// Fallback BASE_URL if not provided in .env
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/opportunities", franchiseRoutes);
app.use("/api/auth", authRoutes);

// Ensure uploads dir exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath); // Absolute path
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Upload full form with multiple files
// app.post(
//   "/api/submit-form",
//   upload.fields([
//     { name: "fddFile", maxCount: 1 },
//     { name: "brandLogo", maxCount: 1 },
//     { name: "brandBanner", maxCount: 1 },
//     { name: "marketingBrochure", maxCount: 1 },
//     { name: "galleryImages", maxCount: 5 },
//   ]),
//   async (req, res) => {
//     try {
//       console.log("📥 Raw req.body:", req.body);
//       console.log("📁 Uploaded files:", req.files);

//       let formData;
//       try {
//         formData = JSON.parse(req.body.formData);
//       } catch (parseError) {
//         console.error("❌ Invalid JSON in formData:", parseError);
//         return res.status(400).json({
//           message: "Invalid JSON format in formData",
//           error: parseError.message,
//         });
//       }

//       formData.title = req.body.title;
//       formData.slug = slugify(formData.title, { lower: true, strict: true });

//       const files = req.files || {};

//       const getFileUrl = (field) =>
//         files[field] && files[field][0]
//           ? `${BASE_URL}/uploads/${files[field][0].filename}`
//           : "";

//       formData.fddFile = getFileUrl("fddFile");
//       formData.brandLogo = getFileUrl("brandLogo");
//       formData.brandBanner = getFileUrl("brandBanner");
//       formData.marketingBrochure = getFileUrl("marketingBrochure");

//       formData.galleryImages = files.galleryImages
//         ? files.galleryImages.map(
//             (img) => `${BASE_URL}/uploads/${img.filename}`
//           )
//         : [];

//       console.log("📦 Final parsed formData:", formData);

//       const opportunity = new FranchiseOpportunity(formData);
//       await opportunity.save();

//       res.status(200).json({
//         message: "Form and files uploaded successfully",
//         data: opportunity,
//       });
//     } catch (error) {
//       console.error("❌ Upload error:", error);
//       res.status(500).json({
//         message: "Server error",
//         error: error.message || error,
//         stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
//       });
//     }
//   }
// );

app.post(
  "/api/submit-form",
  upload.fields([
    { name: "fddFile", maxCount: 1 },
    { name: "brandLogo", maxCount: 1 },
    { name: "brandBanner", maxCount: 1 },
    { name: "marketingBrochure", maxCount: 1 },
    { name: "galleryImages", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      console.log("📥 Raw req.body:", req.body);
      console.log("📁 Uploaded files:", req.files);

      // Step 1: Parse formData safely
      let formData = {};
      if (req.body.formData) {
        try {
          formData = JSON.parse(req.body.formData);
        } catch (parseError) {
          return res.status(400).json({
            message: "Invalid JSON format in formData",
            error: parseError.message,
          });
        }
      }

      // // Step 2: Add title & slug
      // formData.title = req.body.title || formData.title || "Untitled";
      // formData.slug = slugify(formData.title, { lower: true, strict: true });

      // Step 3: Handle file uploads
      const files = req.files || {};
      const getFileUrl = (field) =>
        files[field] && files[field][0]
          ? `${BASE_URL}/uploads/${files[field][0].filename}`
          : "";

      formData.fddFile = getFileUrl("fddFile");
      formData.brandLogo = getFileUrl("brandLogo");
      formData.brandBanner = getFileUrl("brandBanner");
      formData.marketingBrochure = getFileUrl("marketingBrochure");
      formData.galleryImages = files.galleryImages
        ? files.galleryImages.map(
            (img) => `${BASE_URL}/uploads/${img.filename}`
          )
        : [];

      // Step 4: Handle fddIssuanceDate
      if (formData.fddIssuanceDate) {
        const parsedDate = new Date(formData.fddIssuanceDate);
        formData.fddIssuanceDate = isNaN(parsedDate) ? null : parsedDate;
      } else {
        formData.fddIssuanceDate = null;
      }

      // Step 5: Save to DB
      try {
        const opportunity = new FranchiseOpportunity(formData);
        await opportunity.save();

        return res.status(200).json({
          message: "Form and files uploaded successfully",
          data: opportunity,
        });
      } catch (dbError) {
        console.error("❌ Mongoose save error:", dbError);
        return res.status(400).json({
          message: "Database validation failed",
          error: dbError.message,
        });
      }
    } catch (error) {
      console.error("❌ Unexpected server error:", error);
      return res.status(500).json({
        message: "Unexpected server error",
        error: error.message,
      });
    }
  }
);

// Direct image upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ message: "Image uploaded", url: fileUrl });
});

// Fetch image by filename
app.get("/api/images/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  res.sendFile(filePath);
});

// Health check
app.get("/", (req, res) => {
  res.send("📦 File Upload API is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
});
