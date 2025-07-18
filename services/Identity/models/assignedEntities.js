// models/page.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const AssignedEntities = sequelize.define(
  "AssignedEntities",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userName: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    entityKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "AssignedEntities",
    timestamps: true, // Disable timestamps
  }
);

module.exports = AssignedEntities;
