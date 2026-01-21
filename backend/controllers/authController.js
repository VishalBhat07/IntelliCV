const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      contact,
      profile_summary,
    } = req.body;

    // Check if email already exists
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ msg: "Email already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      first_name,
      middle_name,
      last_name,
      email,
      password: hashed,
      contact, // JSON array (multi-valued)
      profile_summary,
      // registration_date auto-filled
    });

    res.json({
      msg: "Registration successful",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Invalid email" });

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid password" });

    // Generate JWT
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      msg: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        contact: user.contact,
        profile_summary: user.profile_summary,
        profile_picture: user.profile_picture,
        location: user.location,
        portfolio: user.portfolio,
        title: user.title,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/profile/:user_id - Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      user_id: user.user_id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      email: user.email,
      contact: user.contact,
      profile_summary: user.profile_summary,
      profile_picture: user.profile_picture,
      location: user.location,
      portfolio: user.portfolio,
      title: user.title,
      registration_date: user.registration_date,
      account_age: user.account_age,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/auth/profile/:user_id - Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log("Updating profile for user:", user_id);
    console.log("Request body keys:", Object.keys(req.body));

    const {
      first_name,
      middle_name,
      last_name,
      contact,
      profile_summary,
      profile_picture,
      location,
      portfolio,
      title,
    } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user fields
    if (first_name !== undefined) user.first_name = first_name;
    if (middle_name !== undefined) user.middle_name = middle_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (contact !== undefined) user.contact = contact;
    if (profile_summary !== undefined) user.profile_summary = profile_summary;
    if (profile_picture !== undefined) user.profile_picture = profile_picture;
    if (location !== undefined) user.location = location;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (title !== undefined) user.title = title;

    await user.save();

    res.json({
      msg: "Profile updated successfully",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        contact: user.contact,
        profile_summary: user.profile_summary,
        profile_picture: user.profile_picture,
        location: user.location,
        portfolio: user.portfolio,
        title: user.title,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: err.message });
  }
};
