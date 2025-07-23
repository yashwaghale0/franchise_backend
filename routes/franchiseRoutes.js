const express = require("express");
const router = express.Router();
const FranchiseOpportunity = require("../models/FranchiseOpportunity");
const {getFranchiseeById,getAllFranchisee} = require("../controllers/franchiseController");
// Route to get all franchise opportunities
router.get("/", getAllFranchisee);

// Get a single franchise opportunity by ID
router.get("/:id",getFranchiseeById);


module.exports = router;