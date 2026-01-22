const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");

// POST /api/resume/generate - Generate resume with Gemini
router.post("/generate", resumeController.generateResume);

// POST /api/resume/regenerate - Regenerate resume with user feedback
router.post("/regenerate", resumeController.regenerateResume);

// POST /api/resume/analyze-ats - Analyze resume for ATS compatibility
router.post("/analyze-ats", resumeController.analyzeATS);

// POST /api/resume/save - Save or update a resume
router.post("/save", resumeController.saveResume);

// GET /api/resume/single/:resume_id - Get a specific resume by ID
router.get("/single/:resume_id", resumeController.getResumeById);

// DELETE /api/resume/:resume_id - Delete a resume
router.delete("/:resume_id", resumeController.deleteResume);

// GET /api/resume/latest/:user_id - Get latest resume
router.get("/latest/:user_id", resumeController.getLatestResume);

// GET /api/resume/:user_id - Get all resumes for a user
router.get("/:user_id", resumeController.getResumes);

module.exports = router;
