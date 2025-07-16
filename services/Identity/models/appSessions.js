// models/page.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const AppSessions = sequelize.define(
  "AppSessions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    guid: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    clientScope: {
      type: DataTypes.STRING(2056),
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    userRole: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    issuedTo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "AppSessions",
    timestamps: true, // Disable timestamps
  }
);

module.exports = AppSessions;
