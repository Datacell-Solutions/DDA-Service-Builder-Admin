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
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: "Users",
    timestamps: true, // Disable timestamps
  }
);


module.exports = Users;
