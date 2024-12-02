const express = require("express");
const morgan = require("morgan");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
require("./database/models");
const routerManager = require("./routes");
const path = require("path");
const rfs = require("rotating-file-stream"); // version 2.x
const { respondWithError } = require("./src/helpers/response");
const app = express();
const cron = require("node-cron");
const tripService = require("./src/mpModules/trip/tripService");

app.use(logger("dev"));
var corsOptions = {
  origin: "*",
  methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
  exposedHeaders: ["Content-Length", "Authorization", "Accept-Language"],
  credentials: true,
};

app.use(cors(corsOptions));

// log configuration
// create a rotating write stream
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "logs"),
});

// // //Tạo cron
// cron.schedule('*/5 * * * *', () => {
//   tripService.updateDb();
// });
// // //End tạo cron

// setup the logger
// app.use(morgan('combined', { stream: accessLogStream }));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "5000mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "5000mb", extended: true }));

routerManager(app);

// error handler
const { HttpStatusCode } = require("./src/helpers/errorCodes");

app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600 }));
app.disable("etag");

// 404 error
app.use((req, res) => {
  let api = {
    ip: req.headers["x-forwarded-for"],
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
  };
  res.json(respondWithError(HttpStatusCode.NOT_FOUND, "API not found"));
});

// 500 error
app.use((err, req, res) => {
  res.json(
    respondWithError(
      ERROR_CODE_SYSTEM_ERROR,
      `System error: ${err.message}`,
      err
    )
  );
});

app.use((req, res) => {
  let api = {
    ip: req.headers["xforwardedfor"],
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
  };
  res.json(respondWithError(HttpStatusCode.NOT_FOUND, "API not found"));
});
module.exports = app;
