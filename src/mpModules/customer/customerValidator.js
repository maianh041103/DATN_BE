import { respondWithError } from "../../helpers/response";

const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");

const Joi = BaseJoi.extend(Extension);

const { ERROR_CODE_INVALID_PARAMETER } = require("../../helpers/errorCodes");

const createSchema = Joi.object().keys({
  fullName: Joi.string().max(50).required(),
  phone: Joi.string().required(),
  email: Joi.string().email().allow(null).allow(""),
  birthday: Joi.string().allow(null).allow(""),
  gender: Joi.string().valid(["male", "female", "other"]),
  code: Joi.string().allow(null).allow(""),
  taxCode: Joi.string().allow(null).allow(""),
  avatarId: Joi.number().integer().allow(null).allow(""),
  // password: Joi.string().required(),
  groupCustomerId: Joi.any(),
  address: Joi.string().allow(null).allow(""),
  position: Joi.number().integer().allow(null).allow(""),
  note: Joi.string().allow(null).allow(""),
  facebook: Joi.string().allow(null).allow(""),
  wardId: Joi.number().integer().min(0).allow(null).allow(""),
  districtId: Joi.number().integer().min(0).allow(null).allow(""),
  provinceId: Joi.number().integer().min(0).allow(null).allow(""),
  type: Joi.number().integer().allow(null).allow(""),
  point: Joi.number().integer().allow(null).allow(""),
  debt: Joi.number().integer().allow(null).allow(""),
  status: Joi.string().allow(null).allow(""),
  lat: Joi.string().allow(null).allow(""),
  lng: Joi.string().allow(null).allow(""),
  companyName: Joi.string().allow(null).allow(""),
  branchId: Joi.number().allow(null).allow("")
});

export function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, createSchema);
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

export function resetPasswordValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    customerId: Joi.number().integer().required(),
    newPassword: Joi.string().max(20).required(),
  });
  const result = Joi.validate(body, validSchema);
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

const updateSchema = Joi.object().keys({
  fullName: Joi.string().max(50).allow(null).allow(""),
  code: Joi.string().allow(null).allow(""),
  phone: Joi.string().allow(null).allow(""),
  email: Joi.string().email().allow(null).allow(""),
  birthday: Joi.string().allow(null).allow(""),
  gender: Joi.string().valid(["male", "female", "other"]),
  taxCode: Joi.string().allow(null).allow(""),
  avatarId: Joi.number().integer().allow(null).allow(""),
  groupCustomerId: Joi.any(),
  address: Joi.string().allow(null).allow(""),
  position: Joi.number().integer().allow(null).allow(""),
  note: Joi.string().allow(null).allow(""),
  facebook: Joi.string().allow(null).allow(""),
  wardId: Joi.number().integer().min(0).allow(null).allow(""),
  districtId: Joi.number().integer().min(0).allow(null).allow(""),
  provinceId: Joi.number().integer().min(0).allow(null).allow(""),
  type: Joi.number().integer().allow(null).allow(""),
  status: Joi.string().allow(null).allow(""),
  lat: Joi.string().allow(null).allow(""),
  lng: Joi.string().allow(null).allow(""),
  companyName: Joi.string().allow(null).allow(""),
  branchId: Joi.number().allow(null).allow("")
});

export async function updateValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, updateSchema);
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
