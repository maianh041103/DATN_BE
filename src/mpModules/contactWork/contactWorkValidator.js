const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

export function contactWorkValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().max(13).min(9).required(),
    email: Joi.string().email().allow(null).allow(""),
    content: Joi.string().required(),
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

export function updateContactWorkValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    note: Joi.string().allow(null).allow(""),
    status: Joi.number().allow(null).allow(""),
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
