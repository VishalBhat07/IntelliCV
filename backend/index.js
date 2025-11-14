const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./config/db");
// const authRoutes = require("./src/routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// base route
app.get("/", (req, res) => {
  res.send("IntelliCV Backend is running...");
});

// API routes
// app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;

sequelize.sync().then(() => {
  console.log("MySQL Database Connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
