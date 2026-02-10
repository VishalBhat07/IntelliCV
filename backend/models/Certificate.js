const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Certificate = sequelize.define(
  "Certificate",
  {
    cert_id: {
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

    issuing_org: {
      type: DataTypes.STRING,
    },

    issue_date: {
      type: DataTypes.DATE,
    },

    file_path: {
      type: DataTypes.STRING, // link stored in Mongo or Cloud storage
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
    tableName: "Certificate",
  }
);

module.exports = Certificate;
