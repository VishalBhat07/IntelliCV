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
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
