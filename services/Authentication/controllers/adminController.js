const { AppError } = require("../../../utils/errorHandler.js");
const { sequelize } = require("../../../config/database.js");
const bcrypt = require("bcryptjs");

const {
  signJwt,
  decryptJwt,
  encryptText,
  decryptText,
} = require("../../../utils/security.js");
const generateGuid = require("../../../utils/guid.js");

const Users = require("../models/users.js");

const getAdminLogin = async (req, res, next) => {
  var { username, password } = req.body;
  var responseBody = null;

  const attemptedUser = await Users.findOne({
      where: { username: username, clientSecret: client_secret, isActive: 1 },
    });

  const hashedPassword = bcrypt.hashSync(password, 10);

  res.send({
    Status: 500,
    Error: { username, hashedPassword },
  });
};

module.exports = { getAdminLogin };
