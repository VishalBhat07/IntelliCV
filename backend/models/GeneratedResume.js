const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const GeneratedResume = sequelize.define(
  "Generated_Resume",
  {
    resume_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    resume_html: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    generated_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    match_score: {
      type: DataTypes.FLOAT,
    },

    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "Generated_Resume",
  }
);

module.exports = GeneratedResume;
