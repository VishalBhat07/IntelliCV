const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");

// POST /api/resume/generate - Generate resume with Gemini
router.post("/generate", resumeController.generateResume);

// GET /api/resume/:user_id - Get all resumes for a user
router.get("/:user_id", resumeController.getResumes);

// GET /api/resume/latest/:user_id - Get latest resume
router.get("/latest/:user_id", resumeController.getLatestResume);

module.exports = router;
