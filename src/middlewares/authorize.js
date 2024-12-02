const _ = require("lodash");
const { respondWithError } = require("../helpers/response");
const { HttpStatusCode } = require("../helpers/errorCodes");

export async function authorize(req, res, next) {
  next();
  // try {
  //   const { permissions = [], apiRole = "" } = req;
  //   if (apiRole === "all") {
  //     next();
  //   } else if (
  //     _.isArray(apiRole) &&
  //     !!_.intersection(apiRole, permissions).length
  //   ) {
  //     next();
  //   } else if (!_.isArray(apiRole) && permissions.includes(apiRole)) {
  //     next();
  //   } else {
  //     console.log("unauthorize....");
  //     res.json(respondWithError(HttpStatusCode.FORBIDDEN, "Forbidden"));
  //     return;
  //   }
  // } catch (e) {
  //   res.json(respondWithError(HttpStatusCode.FORBIDDEN, "Forbidden"));
  // }
}
