const { AppError } = require("../../../utils/errorHandler.js");
const { sequelize } = require("../../../config/database.js");
const bcrypt = require("bcryptjs");

const sendResponse = require("../../../utils/responseHandler.js");

const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../../../utils/security.js");
const generateGuid = require("../../../utils/guid.js");

const { sendError } = require("../../../utils/errorHandler.js");

const Users = require("../models/users.js");
const AppSessions = require("../models/appSessions.js");

const getAdminLogin = async (req, res, next) => {
  var { username, password } = req.body;
  const clientHeader = req.get("ClientId") || null;
  var responseBody = null;

  try {
    const attemptedUser = await Users.findOne({
      where: { userName: username, isActive: true, role: "admin" },
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
          userRole: attemptedUser.role,
          channel: clientHeader,
          clientId: clientHeader,
          clientScope: "master",
        });

        const payload = {
          session: newSession,
          userName: attemptedUser.userName,
          userRole: attemptedUser.role,
        };

        const jwt = signJwt(payload);

        const encryptedToken = encryptText(jwt);

        return sendResponse(req, res, 200, { token: encryptedToken });
      }
    }

    return sendError(req, res, 400, "Invalid credentials");
  } catch (err) {
    console.log(err);
    return sendError(req, res, 500, "An Error Occured");
  }
};

module.exports = { getAdminLogin };
