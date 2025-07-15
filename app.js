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

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(expressLayouts);
// Define the path for views
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");
app.use(express.static("public"));

app.get("/", function (re, res) {
  res.render("home", {});
});

app.get("/login", function (re, res) {
  res.render("login", {});
});
// app.use(httpLogger);

const AuthRoutes = require("./services/Authentication/routes");

app.use("/Auth", AuthRoutes);

app.get("/initialize-database", attempSynchronization);

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
