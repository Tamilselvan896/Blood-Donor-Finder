const express = require("express");
const router = express.Router();

const { protect, optionalAuth } = require("../middleware/auth");

const {
  getDonors,
  createDonor,
  deleteDonor,
} = require("../controllers/donorController");

router.get("/", getDonors);
router.post("/", optionalAuth, createDonor);
router.delete("/", protect, deleteDonor);

module.exports = router;