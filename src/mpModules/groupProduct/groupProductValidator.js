const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

const schema = Joi.object().keys({
  name: Joi.string().max(255).required(),
  description: Joi.string().max(255).allow(null).allow(""),
});

export async function createValidator(req, res, next) {
  const result = Joi.validate(req.body, schema);
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
