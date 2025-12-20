const express = require("express");
const router = express.Router();
const {
  uploadMiddleware,
  handleUpload,
  streamFile,
  exportUserDocuments,
  listUserDocuments,
} = require("../controllers/uploadController");
const { processDocuments } = require("../controllers/llmController");

// POST /api/upload -> multipart/form-data fields: user_id, files[]
router.post("/", uploadMiddleware, handleUpload);

// GET /api/upload/:id -> stream file from GridFS
router.get("/:id", streamFile);

// GET /api/upload/list/:userId -> list user documents
router.get("/list/:userId", listUserDocuments);

// POST /api/upload/export -> export all documents for a user to disk
router.post("/export", exportUserDocuments);

// POST /api/upload/process -> process documents and populate database using LLM
router.post("/process", processDocuments);

module.exports = router;
