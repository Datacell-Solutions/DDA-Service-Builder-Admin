// routes/index.js
const express = require("express");
const router = express.Router();

// Middleware for common error handling and validation can be added here
const { adminSessionAuth } = require("../../middlewares/adminCheck");

const { getUsers } = require("./dashboard");

// Routes
router.get("/", adminSessionAuth, function (req, res) {
  res.render("dashboardmain", {
    layout: "layouts/dashboard",
    title: "Dashboard",
    userData: req.sessionData,
  });
});

router.get("/users/list", adminSessionAuth, getUsers);

module.exports = router;
