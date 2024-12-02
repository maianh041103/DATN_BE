const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

const configurationSchema = Joi.object().keys({
  key: Joi.string().max(255).required(),
  value: Joi.string().required(),
  type: Joi.number().integer().min(0).allow(null).allow(""),
  displayOrder: Joi.number().integer().min(0).allow(null).allow(""),
  status: Joi.number().integer().min(0).allow(null).allow(""),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, configurationSchema);
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
