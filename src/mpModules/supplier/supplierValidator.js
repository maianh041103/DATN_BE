const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const schema = Joi.object().keys({
  name: Joi.string().max(255).required(),
  phone: Joi.string().max(255).required(),
  email: Joi.string().max(255).allow(null).allow(""),
  companyName: Joi.string().max(500).allow(null).allow(""),
  code: Joi.string().max(255).allow(null).allow(""),
  taxCode: Joi.string().max(255).allow(null).allow(""),
  address: Joi.string().max(1024).allow(null).allow(""),
  wardId: Joi.number().integer().min(0).allow(null).allow(""),
  branchId: Joi.number().integer().min(0).allow(null).allow(""),
  districtId: Joi.number().integer().min(0).allow(null).allow(""),
  provinceId: Joi.number().integer().min(0).allow(null).allow(""),
  note: Joi.string().allow(null).allow(""),
  groupSupplierId: Joi.number().integer().min(0).allow(null).allow(""),
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
