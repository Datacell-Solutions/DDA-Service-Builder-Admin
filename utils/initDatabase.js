// models/index.js
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database.js");
const generateGuid = require("./guid.js");

// Auth
const Clients = require("../services/Identity/models/client.js");
const AppSessions = require("../services/Identity/models/appSessions.js");
const Users = require("../services/Identity/models/users.js");
const Entities = require("../services/Identity/models/entities.js");

const models = {
  Clients,
  AppSessions,
  Users,
  Entities,
};

async function attempSynchronization(req, res) {
  try {
    await sequelize.sync({ alter: true, force: true }).then(async () => {
      console.log("Database synced. Inserting default data...");

      await Users.create({
        userName: process.env.DEFAULT_ADMIN_USERNAME,
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        fullName: "System Admin",
        email: "admin@system.com",
        entity: "",
        type: "admin",
        isActive: true,
        createdBy: process.env.DEFAULT_ADMIN_USERNAME,
      });

      await Clients.create({
        guid: generateGuid(),
        clientId: process.env.DEFAULT_CLIENT_ID,
        clientSecret: process.env.DEFAULT_CLIENT_SECRET,
        clientScope: "master",
        isActive: true,
        createdBy: process.env.DEFAULT_ADMIN_USERNAME,
      });

      await Clients.create({
        guid: generateGuid(),
        clientId: process.env.DEFAULT_API_CLIENT_ID,
        clientSecret: process.env.DEFAULT_API_CLIENT_SECRET,
        clientScope: "api",
        isActive: true,
        createdBy: process.env.DEFAULT_ADMIN_USERNAME,
      });

      await Entities.create({
        guid: generateGuid(),
        entityKey: process.env.DEFAULT_ENTITY_KEY,
        fullName: "",
        logo: "/files/entitydefault.jpg",
        isActive: true,
        createdBy: process.env.DEFAULT_ADMIN_USERNAME,
      });

      await Users.create({
        userName: process.env.DEFAULT_ENTITY_USERNAME,
        password: process.env.DEFAULT_ENTITY_USER_PASSWORD,
        fullName: "Entity User",
        email: "entityuser@system.com",
        entity: process.env.DEFAULT_ENTITY_KEY,
        type: "entity",
        role: "business",
        isActive: true,
        createdBy: process.env.DEFAULT_ADMIN_USERNAME,
      });
    });

    res.send("✅ All models synced to database schema.");
  } catch (err) {
    const logDir = path.join(__dirname, "../logs");

    // Ensure the logs folder exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    const date = new Date();
    const formattedDate = `${String(date.getSeconds()).padStart(
      2,
      "0"
    )}-${String(date.getMinutes()).padStart(2, "0")}-${String(
      date.getHours()
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;

    const logFile = path.join(logDir, "sync-error-" + formattedDate + ".log");

    const logEntry = `
[${new Date().toISOString()}] Sync Error: ${err.message}
${err.stack || err.toString()}
--------------------------------------------------
`;

    fs.appendFileSync(logFile, logEntry, "utf8");

    res.status(500).send("❌ Error syncing models");
  }
}

module.exports = { attempSynchronization };
