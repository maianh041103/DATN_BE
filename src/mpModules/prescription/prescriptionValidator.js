const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

const schema = Joi.object().keys({
  name: Joi.string().max(255).required(),
  code: Joi.string().max(255).allow(null).allow(""),
  branchId: Joi.number().integer().min(0).allow(null).allow(""),
  doctorId: Joi.number().integer().min(0).allow(null).allow(""),
  healthFacilityId: Joi.number().integer().min(0).allow(null).allow(""),
  gender: Joi.string().max(255).allow(null).allow(""),
  age: Joi.string().max(255).allow(null).allow(""),
  weight: Joi.string().max(255).allow(null).allow(""),
  identificationCard: Joi.string().max(255).allow(null).allow(""),
  healthInsuranceCard: Joi.string().max(255).allow(null).allow(""),
  address: Joi.string().max(255).allow(null).allow(""),
  supervisor: Joi.string().max(255).allow(null).allow(""),
  phone: Joi.string().max(255).allow(null).allow(""),
  diagnostic: Joi.string().max(255).allow(null).allow(""),
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
