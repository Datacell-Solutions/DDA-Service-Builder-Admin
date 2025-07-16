const express = require("express");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");

const sequelize = require("./config/database");
const { attempSynchronization } = require("./utils/initDatabase");

dotenv.config();
const port = process.env.PORT;

const app = express();

// app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(expressLayouts);
// Define the path for views
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");
app.use(express.static("public"));

const unAuthOnly = require("./middlewares/unAuthenticatedOnly");

app.get("/", unAuthOnly, function (re, res) {
  res.render("home", {});
});

app.get("/login", unAuthOnly, function (re, res) {
  res.render("login", {});
});

// app.use(httpLogger);

const AuthRoutes = require("./services/Identity/tokenRoutes");
const IdentityRoutes = require("./services/Identity/routes");

app.use("/Auth", AuthRoutes);
app.use("/Identity", IdentityRoutes);

const dashboardRoutes = require("./services/dashboard/routes");
app.use("/Dashboard", dashboardRoutes);

app.get(
  "/initialize-database",
  async (req, res, next) => {
    const key = req.query.key || "";
    const master_key = process.env.Setup_Key;
    if (!!key && key == master_key) {
      next();
      return false;
    } else {
      res.status(401).json({ Status: 401, Error: "Restricted access" });
    }
  },
  attempSynchronization
);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "✅ Connection to SQL Server has been established successfully."
    );
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
