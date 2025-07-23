const FranchiseOpportunity = require("../models/FranchiseOpportunity");
const configs = require("../configs");

exports.getFranchiseeById= async (req, res) => {
    try {
      const opportunity = await FranchiseOpportunity.findById(req.params.id);
      if (!opportunity) {
        return res.status(404).json({ message: "Franchise not found" });
      }
      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching franchise:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

exports.getAllFranchisee= async (req, res) => {
    try {
      const data = await FranchiseOpportunity.find().sort({ createdAt: -1 });
      res.status(200).json(data);
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ message: "Server Error", err });
    }
  }

exports.createFranchisee= async (req, res) => {
    try {
      const formData = JSON.parse(req.body.formData);
      const files = req.files;
      console.log(files);

      const getFileUrl = (field) =>
        files[field] && files[field][0]
          ? `${configs.IMAGE_BASE_URL}/${
              files[field][0].filename
            }`
          : "";

      formData.fddFile = getFileUrl("fddFile");
      formData.brandLogo = getFileUrl("brandLogo");
      formData.brandBanner = getFileUrl("brandBanner");
      formData.marketingBrochure = getFileUrl("marketingBrochure");

      formData.galleryImages = files.galleryImages
        ? files.galleryImages.map(
            (img) =>
              `${configs.IMAGE_BASE_URL}/${img.filename}`
          )
        : [];

      const opportunity = new FranchiseOpportunity(formData);
      await opportunity.save();

      res.status(200).json({
        message: "Form and files uploaded successfully",
        data: opportunity,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }