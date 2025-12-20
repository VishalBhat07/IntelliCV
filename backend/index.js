const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js");
const educationRoutes = require("./routes/educationRoutes.js");
const jobRoutes = require("./routes/jobRoutes.js");
const resumeRoutes = require("./routes/resumeRoutes.js");
const { connect } = require("./config/mongo.js");
// ensure models are registered so sequelize can sync tables
require("./models/Document.js");
require("./models/Education.js");
require("./models/Certificate.js");
require("./models/Project.js");
require("./models/JobDescription.js");
require("./models/GeneratedResume.js");

const app = express();

app.use(cors());
app.use(express.json());

// base route
app.get("/", (req, res) => {
  res.send("IntelliCV Backend is running...");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/job-description", jobRoutes);
app.use("/api/resume", resumeRoutes);

const PORT = process.env.PORT;

// Connect to MongoDB first, then sync MySQL and start server
connect()
  .then(() => {
    console.log("Starting server... connecting to MongoDB");
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    return sequelize.sync();
  })
  .then(() => {
    console.log("MySQL Database Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
