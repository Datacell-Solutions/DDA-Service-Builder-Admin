// routes/index.js
const express = require("express");
const router = express.Router();

// Import all controllers
const { createUser } = require("./controllers/userController");
const { getAdminLogin } = require("./controllers/adminController");

// Middleware for common error handling and validation can be added here
const {adminTokenAuth} = require("../../middlewares/adminCheck");

// Routes
router.post("/user/create", adminTokenAuth, createUser);

module.exports = router;
