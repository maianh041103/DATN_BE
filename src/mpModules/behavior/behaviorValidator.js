const { respondWithError } = require("../../helpers/response");

const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

const behaviorSchema = Joi.object().keys({
  accountId: Joi.number().integer().allow(null).allow(""),
  // product - article - ...
  objectId: Joi.number().integer().allow(null).allow(""),
  // type: staff - customer - manager ...
  type: Joi.number().integer().allow(null).allow(""),
  action: Joi.string().allow(null).allow(""),
  data: Joi.allow(null).allow(""),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, behaviorSchema);

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
