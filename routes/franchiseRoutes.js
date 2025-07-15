const express = require("express");
const router = express.Router();
const FranchiseOpportunity = require("../models/FranchiseOpportunity");

// Route to get all franchise opportunities
router.get("/", async (req, res) => {
  try {
    const data = await FranchiseOpportunity.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server Error", err });
  }
});

module.exports = router;

// Get a single franchise opportunity by ID
router.get("/:id", async (req, res) => {
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
});
