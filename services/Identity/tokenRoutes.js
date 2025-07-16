// routes/index.js
const express = require("express");
const router = express.Router();

const { checkClientOnly } = require("../../middlewares/clientCheck");

// Import all controllers
const { getClientToken } = require("./controllers/clientsController");
const { getAdminLogin } = require("./controllers/adminController");
const { createUserSession } = require("./controllers/userController");

// Routes
router.post("/client/Login", getClientToken);
router.post("/admin/login", getAdminLogin);

router.post("/client/user/login", checkClientOnly, createUserSession);

router.get("/admin/authorized", function async(req, res) {
  const authToken = req.query.token;
  if (authToken) {
    // 2. Set it as a cookie named "authToken"
    res.cookie("SessionAuth", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
  }

  setTimeout(() => {
    res.render("redirect", {
      layout: "",
      title: "Redirect Page",
      target: "/dashboard",
    });
  }, 500);
});

router.get("/admin/logout", function async(req, res) {
  const authToken = req.cookies.SessionAuth;
  if (authToken) {
    res.cookie("SessionAuth", null, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
  }
  setTimeout(() => {
    res.render("redirect", {
      layout: "",
      title: "Redirect Page",
      target: "/",
    });
  }, 500);
});

module.exports = router;
