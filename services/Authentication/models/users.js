// models/page.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const bcrypt = require("bcryptjs");

const Users = sequelize.define(
  "Users",
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(500),
      allowNull: true,
      set(value) {
        // Hash the clientSecret before saving
        const hashedSecret = bcrypt.hashSync(value, 10);
        this.setDataValue("password", hashedSecret);
      },
    },
    entity: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "dda", "entity"),
      allowNull: true,
      defaultValue: "entity",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "Users",
    timestamps: false, // Disable timestamps
  }
);
module.exports = Users;
