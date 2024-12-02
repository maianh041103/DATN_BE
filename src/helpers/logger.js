const _ = require("lodash");
const config = require("config");
const { CentralizedLogger } = require("../lib/logger/lib-loggers");
const logEnabled = _.get(config, "logger.enabled", false);

export const LogLevel = {
  Emerg: "emerg",
  Alert: "alert",
  Crit: "crit",
  Error: "error",
  Warning: "warning",
  Notice: "notice",
  Info: "info",
  Debug: "debug",
};

export const CoreLogger = new CentralizedLogger();

export function errorLog(data, customMessage) {
  log(LogLevel.Error, data, customMessage);
}

export function debugLog(data, customMessage) {
  log(LogLevel.Debug, data, customMessage);
}

export function infoLog(data, customMessage) {
  log(LogLevel.Info, data, customMessage);
}

export function apiLog(req, res) {
  const data = {};

  if (req) {
    data.request = { ...req };
  }

  if (res) {
    data.response = { ...res };
    delete data.response.obj;
    delete data.response.data;
    delete data.response.text;
  }

  debugLog(data);
}

function log(logLevel, data, customMessage = "LOG") {
  if (logEnabled) {
    try {
      CoreLogger.log({
        level: logLevel,
        message: customMessage,
        data,
      });
    } catch (err) {
      errorLog(err, "Error in log function in logger");
    }
  }
}
