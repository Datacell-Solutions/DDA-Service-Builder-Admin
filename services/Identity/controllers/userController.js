const { Sequelize, Op } = require("sequelize");
const { AppError } = require("../../../utils/errorHandler.js");
const Clients = require("../models/client.js");
const AppSessions = require("../models/appSessions.js");
const sequelize = require("../../../config/database.js");

const { sendError } = require("../../../utils/errorHandler.js");

const Users = require("../models/users.js");

const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../../../utils/security.js");

const generateGuid = require("../../../utils/guid.js");

const createUser = async (req, res, next) => {
  const { userName, email, password, fullName, entity, role, isActive } =
    req.body;

  // Basic validation
  if (!userName || !email || !password || !isActive) {
    return sendError(req, res, 400, "Missing required fields");
  }

  try {
    // Check if the user already exists by email or userName
    const existingUser = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { userName }],
      },
    });

    if (existingUser) {
      return sendError(
        req,
        res,
        400,
        "User with this email or username already exists"
      );
    }

    // Create new user
    const newUser = await Users.create({
      userName,
      email,
      password, // Password will be hashed automatically due to the setter in the model
      fullName: fullName || "User",
      entity: entity || null, // Default to null if no entity is provided
      role: role || "entity", // Default to 'entity' role
      isActive,
      createdBy: req.sessionUser.userName, // Default to null if no createdBy is provided
    });

    // Respond with the created user (excluding sensitive data like password)
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.send({
      message: "User created successfully",
      user: userWithoutPassword,
    });

    return false;
  } catch (error) {
    console.error(error);
    res.send({ message: "Error creating user", error: error.message });
  }
};

module.exports = {
  createUser,
};
