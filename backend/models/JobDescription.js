const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const JobDescription = sequelize.define(
  "Job_Description",
  {
    job_id: {
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

    company: {
      type: DataTypes.STRING,
    },

    jd_text: {
      type: DataTypes.TEXT,
    },

    embedding_vector: {
      type: DataTypes.TEXT,
      // stored as JSON string (e.g. "[0.12, 0.53, ...]")
    },

    // File upload fields
    mongo_file_id: {
      type: DataTypes.STRING,
    },

    file_name: {
      type: DataTypes.STRING,
    },

    file_size: {
      type: DataTypes.BIGINT,
    },
  },
  {
    timestamps: false,
    tableName: "Job_Description",
  }
);

module.exports = JobDescription;
