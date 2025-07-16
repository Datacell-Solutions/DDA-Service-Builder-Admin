// routes/index.js
const express = require("express");
const router = express.Router();

// Import all controllers
const { createUser } = require("./controllers/userController");
const { exchangeToken } = require("./controllers/clientsController");

// Middleware for common error handling and validation can be added here
const { adminTokenAuth } = require("../../middlewares/adminCheck");
const { checkClientSession } = require("../../middlewares/clientCheck");

// Routes
router.post("/user/create", adminTokenAuth, createUser);
router.post("/token/exchange", checkClientSession, exchangeToken);

module.exports = router;
