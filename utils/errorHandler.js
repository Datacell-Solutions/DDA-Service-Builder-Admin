const fs = require("fs");
const path = require("path");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const sendError = (req, res, Status, Message) => {
  const logDir = path.join(__dirname, "../logs");

  // Ensure the logs folder exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const date = new Date();
  const formattedDate = `${String(date.getSeconds()).padStart(2, "0")}-${String(
    date.getMinutes()
  ).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${date.getFullYear()}`;

  const logFile = path.join(logDir, "app-error-" + formattedDate + ".log");

  const logEntry = `[${new Date().toISOString()}] App Error: ${Message}
--------------------------------------------------
${JSON.stringify({
  path: req.originalUrl,
  hostname: req.hostname,
  method: req.method,
  body: req.body,
  cookies: req.cookies,
})}
--------------------------------------------------
${JSON.stringify({ locals: res.locals, headersSent: res.headersSent })}
`;

  fs.appendFileSync(logFile, logEntry, "utf8");

  res.send({ Status, Error: Message });
  return false;
};

module.exports = { AppError, sendError };
