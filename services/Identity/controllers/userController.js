const { Sequelize, Op } = require("sequelize");
const { AppError } = require("../../../utils/errorHandler.js");
const bcrypt = require("bcryptjs");

const Clients = require("../models/client.js");

const sequelize = require("../../../config/database.js");

const { sendError } = require("../../../utils/errorHandler.js");
const { sendResponse } = require("../../../utils/responseHandler.js");

const Users = require("../models/users.js");
const Entities = require("../models/entities.js");
const AppSessions = require("../models/appSessions.js");
const AssignedEntities = require("../models/assignedEntities.js");

const { clientUserTypes } = require("../../../utils/globals.js");

const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../../../utils/security.js");

const generateGuid = require("../../../utils/guid.js");
const { raw } = require("express");

const createUser = async (req, res, next) => {
  const { userName, email, password, fullName, entity, type, isActive } =
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
      type: type || "entity", // Default to 'entity' type
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

const createUserSession = async (req, res, next) => {
  var { username, password } = req.body;
  var responseBody = null;

  try {
    const attemptedUser = await Users.findOne({
      where: {
        userName: username,
        isActive: true,
        type: {
          [Op.or]: clientUserTypes,
        },
      },
      raw: true,
    });

    if (!!attemptedUser) {
      const passwordComparison = bcrypt.compareSync(
        password,
        attemptedUser.password
      );

      if (!!passwordComparison) {
        const newSessionId = generateGuid();
        const newSession = await AppSessions.create({
          guid: newSessionId,
          userName: attemptedUser.userName,
          userType: attemptedUser.type,
          channel: req.client.clientId,
          clientId: req.client.clientId,
          clientScope: req.client.clientScope,
        });

        var entity = null;

        if (attemptedUser.type == "entity") {
          const userEntity = await Entities.findOne({
            where: {
              entityKey: attemptedUser.entity || "",
            },
          });

          entity = userEntity || null;
        } else if (attemptedUser.type == "dda") {
          const assignedKeys = await AssignedEntities.findAll({
            attributes: ["entityKey"],
            where: {
              userName: attemptedUser.userName,
            },
            raw: true,
          });

          if (!!assignedKeys) {
            const entityKeys = assignedKeys.map((row) => row.entityKey);
            const matchingEntities = await Entities.findAll({
              where: {
                entityKey: {
                  [Op.in]: entityKeys,
                },
              },
              raw: true,
            });

            if (matchingEntities) {
              entity = matchingEntities;
            }
          }
        }

        const payload = {
          session: newSession,
          user: attemptedUser.userName,
          userType: attemptedUser.type,
        };

        const jwt = signJwt(payload);

        const encryptedToken = encryptText(jwt);

        const { password, ...userWithoutPassword } = attemptedUser;

        return sendResponse(req, res, 200, {
          token: encryptedToken,
          user: userWithoutPassword,
          entity,
        });
      }
    }

    return sendError(req, res, 400, "Invalid credentials");
  } catch (err) {
    console.log(err);
    return sendError(req, res, 500, "An Error Occured");
  }
};

module.exports = {
  createUser,
  createUserSession,
};
