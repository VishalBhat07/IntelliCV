const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController.js");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/profile/:user_id - Get user profile
router.get("/profile/:user_id", getProfile);

// PUT /api/auth/profile/:user_id - Update user profile
router.put("/profile/:user_id", updateProfile);

module.exports = router;
