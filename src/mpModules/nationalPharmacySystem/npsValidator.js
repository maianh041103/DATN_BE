const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

export function createValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    branchId: Joi.number().integer().required(),
    code: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  const result = Joi.validate(body, validSchema);
  if (result.error) {
    res.json(
      respondWithError(
        HttpStatusCode.BAD_REQUEST,
        result.error.message,
        result.error.details
      )
    );
    return;
  }
  next();
}

export function updateValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    branchId: Joi.number().integer().allow(null).allow(""),
    code: Joi.string().allow(null).allow(""),
    username: Joi.string().allow(null).allow(""),
    password: Joi.string().allow(null).allow(""),
    note: Joi.string().allow(null).allow(""),
    status: Joi.number().allow(null).allow(""),
    isAutoHandle: Joi.number().allow(null).allow(""),
  });
  const result = Joi.validate(body, validSchema);
  if (result.error) {
    res.json(
      respondWithError(
        HttpStatusCode.BAD_REQUEST,
        result.error.message,
        result.error.details
      )
    );
    return;
  }
  next();
}
