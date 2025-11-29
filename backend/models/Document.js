const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DOCUMENT_TYPES = [
  "Certificates",
  "Project",
  "Education",
  "JobDescription",
  "Miscellaneous",
];

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [DOCUMENT_TYPES],
      },
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    mongo_file_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "Document",
  }
);

Document.DOCUMENT_TYPES = DOCUMENT_TYPES;

module.exports = Document;
