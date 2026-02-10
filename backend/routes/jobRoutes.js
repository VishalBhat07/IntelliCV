const express = require("express");
const router = express.Router();
const multer = require("multer");
const jobController = require("../controllers/jobController");

// Multer memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/job-description - Save job description (text input)
router.post("/", jobController.saveJobDescription);

// POST /api/job-description/extract - Upload file, extract text, save to MySQL
router.post("/extract", upload.single("file"), jobController.extractAndSaveFromFile);

// GET /api/job-description/:user_id - Get job description
router.get("/:user_id", jobController.getJobDescription);

module.exports = router;
