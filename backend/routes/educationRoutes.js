const express = require("express");
const router = express.Router();
const educationController = require("../controllers/educationController");

// POST /api/education - Save education data
router.post("/", educationController.saveEducation);

// GET /api/education/:user_id - Get education data
router.get("/:user_id", educationController.getEducation);

module.exports = router;
