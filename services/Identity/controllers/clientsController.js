const { Sequelize, Op } = require("sequelize");
const { AppError } = require("../../../utils/errorHandler.js");
const Clients = require("../models/client.js");
const sequelize = require("../../../config/database.js");

const { sendError } = require("../../../utils/errorHandler.js");
const { sendResponse } = require("../../../utils/responseHandler.js");

const Users = require("../models/users.js");
const AppSessions = require("../models/appSessions.js");
const Entities = require("../models/entities.js");
const AssignedEntities = require("../models/assignedEntities.js");

const { clientUserTypes } = require("../../../utils/globals.js");

const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../../../utils/security.js");

const generateGuid = require("../../../utils/guid.js");

// Generate a Token for the Client ID
const getClientToken = async (req, res, next) => {
  try {
    const { client_id, client_secret, scope } = req.body;
    console.log({ client_id });
    const currentClient = await Clients.findOne({
      where: { clientId: client_id, clientSecret: client_secret, isActive: 1 },
    });

    if (!currentClient) {
      return next(new AppError("Invalid Client", 404));
    }

    const sessionId = generateGuid();

    const Session = AppSessions.create({
      guid: sessionId,
      clientId: currentClient.clientId,
      clientScope: currentClient.clientScope,
      createDate: new Date(),
    });

    const jwtPayload = {
      client: currentClient.clientId,
      scope: currentClient.scope,
      session: sessionId,
    };

    const jwtToken = signJwt(jwtPayload);
    console.log({ jwtToken });
    const encryptedToken = encryptText(jwtToken);

    res.status(200).json({
      message: "Success",
      accessToken: encryptedToken,
      // jwtToken
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    next(new AppError("Failed to fetch client", 500));
  }
};

const createClient = async (req, res, next) => {
  const { clientId, clientSecret, clientScope } = req.body;

  // Basic validation
  if (!clientId || !clientSecret || !clientScope) {
    return sendError(req, res, 400, "Missing required fields");
  }

  try {
    // Check if the user already exists by email or userName
    const existingClient = await Clients.findOne({
      where: { clientId: clientId },
    });

    if (existingClient) {
      return sendError(req, res, 400, "Client already exists");
    }

    // Create new user
    const newClient = await Clients.create({
      guid: generateGuid(),
      clientId,
      clientSecret,
      clientScope,
      isActive: true,
      createdBy: req.sessionUser.userName,
    });

    // Respond with the created user (excluding sensitive data like password)
    const { clientSecret: _, ...clientWithoutPassword } = newClient.toJSON();

    res.send({
      message: "User created successfully",
      user: clientWithoutPassword,
    });

    return false;
  } catch (error) {
    console.error(error);
    res.send({ message: "Error creating user", error: error.message });
  }
};

const exchangeToken = async (req, res, next) => {
  try {
    const attemptedUser = await Users.findOne({
      where: {
        userName: req.session.userName,
        isActive: true,
        type: {
          [Op.or]: clientUserTypes,
        },
      },
      raw: true,
    });

    if (!!attemptedUser) {
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

      const { password, ...userWithoutPassword } = attemptedUser;
      return sendResponse(req, res, 200, {
        user: userWithoutPassword,
        entity,
      });
    }
  } catch (err) {
    console.log({ err });
  }

  return sendError(req, res, 500, "An Error Occured");
};

module.exports = {
  getClientToken,
  createClient,
  exchangeToken,
};
