const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../utils/security.js");

const Users = require("../services/Identity/models/users.js");
const Clients = require("../services/Identity/models/client.js");

const adminSessionAuth = async (req, res, next) => {
  try {
    // Get the value of the 'auth' cookie from the request
    const authCookie = req.cookies.SessionAuth;

    const decryptedToken = decryptText(authCookie);
    const decryptedJWT = decryptJwt(decryptedToken);

    const sessionUser = await Users.findOne({
      where: { userName: decryptedJWT.session.userName, isActive: true },
    });

    if (!!sessionUser) {
      req.sessionData = decryptedJWT;
      next();
      return false;
    }
  } catch {}

  res.redirect(301, "/login");
  return false;
};

const adminTokenAuth = async (req, res, next) => {
  try {
    console.log("trying now");
    // Get the value of the 'auth' cookie from the request
    const authHeader = req.get("Authorization");
    const authToken = authHeader.split(" ")[1];
    const clientHeader = req.get("ClientId") || null;

    const decryptedToken = decryptText(authToken);
    const decryptedJWT = decryptJwt(decryptedToken);

    if (decryptedJWT.session.clientId == clientHeader) {
      const sessionUser = await Users.findOne({
        where: { userName: decryptedJWT.userName, isActive: true },
      });

      const sessionClient = await Clients.findOne({
        where: { clientId: decryptedJWT.session.clientId || "x1x1x1x1" },
      });

      console.log({ sessionUser, sessionClient });

      if (!!sessionUser && !!sessionClient) {
        req.sessionData = decryptedJWT;
        next();
        return false;
      }
    }
  } catch {}

  res.status(401).json({
    Status: 401,
    Message:
      "You are trying to access a restricted resource, kindly authenticate to proceed.",
  });
  return false;
};

module.exports = { adminSessionAuth, adminTokenAuth };
