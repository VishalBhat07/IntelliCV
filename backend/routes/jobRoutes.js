const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// POST /api/job-description - Save job description
router.post("/", jobController.saveJobDescription);

// GET /api/job-description/:user_id - Get job description
router.get("/:user_id", jobController.getJobDescription);

module.exports = router;
