const express = require("express");
const router = express.Router();
const {
  uploadMiddleware,
  handleUpload,
  streamFile,
  exportUserDocuments,
} = require("../controllers/uploadController");

// POST /api/upload -> multipart/form-data fields: user_id, files[]
router.post("/", uploadMiddleware, handleUpload);

// GET /api/upload/:id -> stream file from GridFS
router.get("/:id", streamFile);

// POST /api/upload/export -> export all documents for a user to disk
router.post("/export", exportUserDocuments);

module.exports = router;
