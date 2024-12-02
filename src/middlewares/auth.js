const _ = require("lodash");
const { respondWithError } = require("../helpers/response");
const jwt = require("jsonwebtoken");
const models = require("../../database/models");
const { HttpStatusCode } = require("../helpers/errorCodes");
const { userStatus } = require("../helpers/choices");
const config = require("config");
const authConfig = _.get(config, "auth", null);

export function extractToken(authorization = "") {
  const bearerHeader = authorization.split(" ");
  if (bearerHeader.length === 2 && bearerHeader[0] === "Bearer") {
    return bearerHeader[1];
  }
  return "";
}

export function verifyToken(token, type) {
  return type === "refresh"
    ? jwt.verify(token, authConfig.secret_refresh_access_token)
    : jwt.verify(token, authConfig.secret_access_token);
}

export async function authenticate(req, res, next) {
  const token = extractToken(req.headers.authorization || "");
  try {
    const decodedToken = verifyToken(token, req.authorization_type);
    const { userId } = decodedToken;
    const user = await models.User.findByPk(userId, {
      attributes: ['id', 'username', 'fullName', 'phone', 'email', 'storeId', 'roleId'],
      include: [
        {
          model: models.Role,
          as: "role",
          attributes: ["id", "name", "description"],
          include: [
            {
              model: models.RolePermission,
              as: "permissions",
              attributes: ["id", "model", "action"],
            },
          ],
        },
      ],
      where: {
        active: userStatus.ACTIVE,
      },
    });

    if (user) {
      req.loginUser = user;
      req.permissions = _.get(user, "role.permissions", []).map(
        (p) => `${_.get(p, "model")}_${_.get(p, "action")}`
      );
      next();
    } else {
      res.json(respondWithError(HttpStatusCode.FORBIDDEN, "Unauthorized"));
    }
  } catch (e) {
    console.log(`authenticate error with the token: ${token}`, e);
    if (_.get(e, "name", "") === "TokenExpiredError") {
      res.json(respondWithError(HttpStatusCode.TOKEN_EXPIRED, "Token Expired"));
      return;
    }
    res.json(respondWithError(HttpStatusCode.UNAUTHORIZED, "Unauthorized"));
  }
}
