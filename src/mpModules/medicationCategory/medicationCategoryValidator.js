const _ = require("lodash");
const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { ERROR_CODE_INVALID_PARAMETER } = require("../../helpers/errorCodes");

const schema = Joi.object().keys({
  code: Joi.string().required(),
  link: Joi.string().allow(null).allow(""),
  registerNumber: Joi.string().required(),
  activeElement: Joi.string().required(),
  content: Joi.string().required(),
  name: Joi.string().required(),
  countryId: Joi.number().integer().allow(null).allow(""),
  packingSpecification: Joi.string().required(),
  unitId: Joi.number().integer().allow(null).allow(""),
  manufactureId: Joi.number().integer().allow(null).allow(""),
});

const schemaUpdate = Joi.object().keys({
  code: Joi.string(),
  link: Joi.string().allow(null).allow(""),
  registerNumber: Joi.string(),
  activeElement: Joi.string(),
  content: Joi.string(),
  name: Joi.string(),
  countryId: Joi.number().integer().allow(null).allow(""),
  packingSpecification: Joi.string(),
  unitId: Joi.number().integer().allow(null).allow(""),
  manufactureId: Joi.number().integer().allow(null).allow(""),
});

export async function medicationCategoryValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, schema);
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

export async function medicationCategoryUpdateValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, schemaUpdate);
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