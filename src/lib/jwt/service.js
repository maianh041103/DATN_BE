const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
const authConfig = _.get(config, "auth", {});

export function signToken(payload, type) {
  switch (type) {
    case "sign":
      return jwt.sign(payload, authConfig.secret_access_token, {
        expiresIn: authConfig.secret_access_token_expire,
      });
    case "refresh":
      return jwt.sign(payload, authConfig.secret_refresh_access_token, {
        expiresIn: authConfig.secret_refresh_access_token_expire,
      });
  }
}
