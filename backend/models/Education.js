const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Education = sequelize.define(
  "Education",
  {
    edu_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    institution_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    field_of_study: {
      type: DataTypes.STRING,
    },
    grade: {
      type: DataTypes.STRING,
    },
    start_year: {
      type: DataTypes.STRING,
    },
    completion_year: {
      type: DataTypes.STRING,
    },
    highlights: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // File upload fields
    // mongo_file_id: {
    //   type: DataTypes.STRING,
    // },

    // file_name: {
    //   type: DataTypes.STRING,
    // },

    // file_size: {
    //   type: DataTypes.BIGINT,
    // },
  },
  {
    timestamps: false,
    tableName: "Education",
  }
);

module.exports = Education;
