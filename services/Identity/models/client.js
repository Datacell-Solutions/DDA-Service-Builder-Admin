// models/page.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const bcrypt = require("bcryptjs");

const Clients = sequelize.define(
  "AppClients",
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
      allowNull: false,
      unique: true,
    },
    clientSecret: {
      type: DataTypes.STRING(500),
      allowNull: true,
      set(value) {
        // Hash the clientSecret before saving
        const hashedSecret = bcrypt.hashSync(value, 10); // 10 rounds of salt
        this.setDataValue("clientSecret", hashedSecret);
      },
    },
    clientScope: {
      type: DataTypes.STRING(2056),
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
    tableName: "AppClients",
    timestamps: true, // Disable timestamps
  }
);

module.exports = Clients;
