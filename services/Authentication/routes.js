// routes/index.js
const express = require("express");
const router = express.Router();

// Import all controllers
const Clients = require("./controllers/userController");
const { getAdminLogin } = require("./controllers/adminController");

// Middleware for common error handling and validation can be added here
// const checkPrivilege = require('../../middlewares/checkPrivilege');

// Template Routes
router.post("/client/Login", Clients.getClientToken);
router.post("/admin/login", getAdminLogin);

module.exports = router;
