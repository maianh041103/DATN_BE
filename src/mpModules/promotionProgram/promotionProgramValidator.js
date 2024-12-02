const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { ERROR_CODE_INVALID_PARAMETER } = require("../../helpers/errorCodes");

const promotionProgramSchema = Joi.object().keys({
  title: Joi.string().max(512).required(),
  slug: Joi.string().max(512).required(),
  description: Joi.string().allow(null).allow(""),
  alt: Joi.string().max(255).allow(null).allow(""),
  link: Joi.string().max(255).allow(null).allow(""),
  imageId: Joi.number().integer().required(),
  sponsor: Joi.string().max(255).required(),
  status: Joi.number().integer().min(0).allow(null).allow(""),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  groupProduct: Joi.array().allow(null).allow("").allow([]),
  listCustomer: Joi.array().allow(null).allow("").allow([]),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, promotionProgramSchema);

  if (result.error) {
    res.json(
      respondWithError(
        ERROR_CODE_INVALID_PARAMETER,
        result.error.message,
        result.error.details
      )
    );
    return;
  }
  next();
}
