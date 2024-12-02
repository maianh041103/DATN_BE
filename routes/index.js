import mpRouterManager from "./mpApi";
import _ from "lodash";

const config = require("config");
const enableMpApi = _.get(config, "enableMpApi", true);

const routerManager = (app) => {
  if (enableMpApi) {
    mpRouterManager(app);
  }
};

module.exports = routerManager;
