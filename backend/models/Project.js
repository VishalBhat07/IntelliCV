const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Project = sequelize.define(
  "Project",
  {
    proj_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    tech_stack: {
      type: DataTypes.STRING, // comma-separated string (React, Node, etc.)
    },

    duration: {
      type: DataTypes.STRING, // Example: "Jan 2024 – Apr 2024"
    },
  },
  {
    timestamps: false,
    tableName: "Project",
  }
);

module.exports = Project;
