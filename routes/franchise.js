// routes/franchise.js
const express = require("express");
const router = express.Router();
const FranchiseOpportunity = require("../models/FranchiseOpportunity");

// Function to generate formatted Opportunity ID
const generateOpportunityId = async () => {
  try {
    const count = await FranchiseOpportunity.countDocuments(); // total documents
    const nextNumber = count + 1; // next number
    const formattedId = `FLS-OPP-${String(nextNumber).padStart(6, "0")}`;
    return formattedId;
  } catch (err) {
    console.error("Error generating opportunity ID:", err);
    throw err;
  }
};

// router.get("/latest", async (req, res) => {
//   try {
//     const lastEntry = await FranchiseOpportunity.findOne()
//       .sort({ flsNumber: -1 })
//       .select("flsNumber");

//     const nextNumber = lastEntry?.flsNumber ? lastEntry.flsNumber + 1 : 1;

//     return res.json({ nextNumber });
//   } catch (error) {
//     console.error("Error fetching FLS number:", error);
//     return res
//       .status(500)
//       .json({ message: "Error fetching latest FLS number" });
//   }
// });

router.get("/latest", async (req, res) => {
  try {
    const lastEntry = await FranchiseOpportunity.findOne()
      .sort({
        flsNumber: -1,
      })
      .select("flsNumber");

    console.log(lastEntry);

    let nextNumber = 1;

    if (lastEntry?.flsNumber) {
      // Extract the numeric part
      const num = lastEntry.flsNumber.split("-");
      // const lastNum = parseInt(lastEntry.flsNumber.replace("fls-opp-", ""), 10);
      const lastNum = parseInt(num[2]);

      nextNumber = lastNum + 1;
    }

    // Format with leading zeros (6 digits)
    const formattedNumber = `FLS-OPP-${String(nextNumber).padStart(6, "0")}`;

    return res.json({ nextNumber: formattedNumber });
  } catch (error) {
    console.error("Error fetching FLS number:", error);
    return res
      .status(500)
      .json({ message: "Error fetching latest FLS number" });
  }
});

// Example in your route (adjust to your logic)

module.exports = router;
