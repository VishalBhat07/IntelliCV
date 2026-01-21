const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Composite attribute
    first_name: { type: DataTypes.STRING, allowNull: false },
    middle_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING, allowNull: false },

    email: {
      type: DataTypes.STRING,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
    },

    // Multi-valued attribute (stored as array JSON)
    contact: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    profile_summary: {
      type: DataTypes.TEXT,
    },

    // Profile picture stored as base64 (needs LONGTEXT for large images)
    profile_picture: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },

    // Location
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Portfolio/Website URL
    portfolio: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Job title/profession
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Registration date
    registration_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    // Derived attribute (virtual)
    account_age: {
      type: DataTypes.VIRTUAL,
      get() {
        const regDate = this.getDataValue("registration_date");
        if (!regDate) return null;

        const ms = Date.now() - regDate.getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24)); // in days
      },
    },
  },
  {
    timestamps: false,
  },
);

module.exports = User;
