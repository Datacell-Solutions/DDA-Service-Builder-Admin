// models/page.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const bcrypt = require("bcryptjs");

const Entities = sequelize.define(
  "Entities",
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
    entityKey: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      set(value) {
        // Hash the clientSecret before saving
        const hashedSecret = bcrypt.hashSync(value, 10); // 10 rounds of salt
        this.setDataValue("clientSecret", hashedSecret);
      },
    },
    logo: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Entities",
    timestamps: true, // Disable timestamps
  }
);

module.exports = Entities;
