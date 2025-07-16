const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../utils/security.js");

const Users = require("../services/Identity/models/users.js");

const unAuthOnly = async (req, res, next) => {
  try {
    // Get the value of the 'auth' cookie from the request
    const authCookie = req.cookies.SessionAuth;
    const clientHeader = req.get("ClientId") || null;

    if (!!authCookie) {
      const decryptedToken = decryptText(authCookie);
      const decryptedJWT = decryptJwt(decryptedToken);

      const sessionUser = await Users.findOne({
        where: { userName: decryptedJWT.userName, isActive: true },
      });

      if (!!sessionUser) {
        res.redirect(301, "/dashboard");
        return false;
      }
    }
  } catch {}

  next();
};

module.exports = unAuthOnly;
