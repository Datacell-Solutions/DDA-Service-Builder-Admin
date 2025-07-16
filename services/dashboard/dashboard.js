const { Sequelize, Op } = require("sequelize");

const Users = require("../Identity/models/users");

const getUsers = async (req, res, next) => {
  try {
    const usersList = await Users.findAll({
      attributes: [
        "id",
        "userName",
        "fullName",
        "type",
        [
          Sequelize.literal(`(
        SELECT "createdAt"
        FROM "AppSessions"
        WHERE "AppSessions"."userName" = "Users"."userName"
        ORDER BY "createdAt" DESC
        LIMIT 1
      )`),
          "lastSessionAt",
        ],
      ],
      raw: true,
    });

    res.render("userslist", {
      layout: "layouts/dashboard",
      title: "Users List",
      userData: req.sessionData,
      usersList,
    });
    return false;
  } catch (error) {
    console.error(error);
    res.send({ message: "Error creating user", error: error.message });
  }
};

module.exports = {
  getUsers,
};
