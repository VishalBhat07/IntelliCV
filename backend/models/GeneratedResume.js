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

    // Resume title for display (e.g., "Senior Product Designer")
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Target company/position (e.g., "Google")
    target: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Structured resume sections stored as JSON
    personal_info: {
      type: DataTypes.JSON,
      allowNull: true,
      // { name, title, email, phone, location, linkedin, github }
    },

    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    experience: {
      type: DataTypes.JSON,
      allowNull: true,
      // [{ position, company, startDate, endDate, location, description }]
    },

    education: {
      type: DataTypes.JSON,
      allowNull: true,
      // [{ degree, institution, year, gpa, highlights }]
    },

    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      // { technical: [], soft: [], tools: [] }
    },

    projects: {
      type: DataTypes.JSON,
      allowNull: true,
      // [{ title, description, technologies, link }]
    },

    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
      // [{ title, issuer, date }]
    },

    // HTML content of the generated resume
    // generated_text: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },

    match_score: {
      type: DataTypes.FLOAT,
    },

    // Comprehensive ATS analysis stored as JSON
    ats_analysis: {
      type: DataTypes.JSON,
      allowNull: true,
      // {
      //   overall_score: number (0-100),
      //   section_scores: {
      //     keywords: number,
      //     skills: number,
      //     experience: number,
      //     education: number,
      //     format: number
      //   },
      //   missing_keywords: string[],
      //   suggestions: string[],
      //   strengths: string[],
      //   analyzed_at: Date
      // }
    },

    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "Generated_Resume",
  },
);

module.exports = GeneratedResume;
