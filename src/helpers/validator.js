const { respondWithError } = require("../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("./errorCodes");

export function validator(req, res, next) {
  const { query } = req;
  const validSchema = Joi.object().keys({
    id: Joi.number().integer().min(1).allow(null).allow(""),
  });
  const result = Joi.validate(query, validSchema);
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

export function phoneValidator(req, res, next) {
  const { query } = req;
  const validSchema = Joi.object().keys({
    phone_number: Joi.string().max(13).min(9),
  });
  const result = Joi.validate(query, validSchema);
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
