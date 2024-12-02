const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const schema = Joi.object().keys({
  name: Joi.string().max(255).required(),
  phone: Joi.string().max(255).required(),
  code: Joi.string().max(255).allow(null).allow(""),
  zipCode: Joi.string().max(255).allow(null).allow(""),
  address1: Joi.string().max(1024).required(),
  address2: Joi.string().max(1024).allow(null).allow(""),
  wardId: Joi.number().integer().allow(null).allow(""),
  districtId: Joi.number().integer().allow(null).allow(""),
  provinceId: Joi.number().integer().allow(null).allow(""),
  isDefaultBranch: Joi.boolean().allow(null).allow(""),
  status: Joi.number().integer().min(0).allow(null).allow(""),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, schema);
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
