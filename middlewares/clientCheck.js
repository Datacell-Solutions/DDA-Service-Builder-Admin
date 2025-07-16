const bcrypt = require("bcryptjs");
const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../utils/security.js");
const Clients = require("../services/Identity/models/client.js");

const checkClientOnly = async (req, res, next) => {
  try {
    const clientId = req.get("ClientId");
    const clientSecret = req.get("ClientSecret");

    const sessionClient = await Clients.findOne({
      where: { clientId: clientId, isActive: true },
    });

    if (!!sessionClient) {
      const passwordComparison = bcrypt.compareSync(
        clientSecret,
        sessionClient.clientSecret
      );

      if (!!passwordComparison) {
        req.client = sessionClient;
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

const checkClientSession = async (req, res, next) => {
  try {
    // Get the value of the 'auth' cookie from the request
    const authHeader = req.get("Authorization");
    const authToken = authHeader.split(" ")[1];
    const clientId = req.get("ClientId");

    const sessionClient = await Clients.findOne({
      where: { clientId: clientId, isActive: true },
    });

    if (!!sessionClient) {
      const decryptedToken = decryptText(authToken);
      const decryptedJWT = decryptJwt(decryptedToken);
      if (decryptedJWT.session.clientId == clientId) {
        req.client = sessionClient;
        req.session = decryptedJWT.session;

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

module.exports = { checkClientOnly, checkClientSession };
