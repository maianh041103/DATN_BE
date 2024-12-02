const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const schema = Joi.object().keys({
  name: Joi.string().max(255).required(),
  phone: Joi.string().max(255).required(),
  email: Joi.string().max(255).allow(null).allow(""),
  address: Joi.string().max(255).required(),
  logoId: Joi.number().integer().allow(null).allow(""),
  businessRegistrationImageId: Joi.number().integer().allow(null),
  businessRegistrationNumber: Joi.string().max(255).allow(null).allow(""),
  wardId: Joi.number().integer().min(0).required(),
  districtId: Joi.number().integer().min(0).required(),
  provinceId: Joi.number().integer().min(0).required(),
  status: Joi.number().integer().min(0).allow(null).allow(""),
  imageId: Joi.number().integer().min(0).allow(null).allow(""),
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
