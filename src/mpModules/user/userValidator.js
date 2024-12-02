const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function createValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    username: Joi.string().max(30).required(),
    fullName: Joi.string().max(30).required(),
    birthday: Joi.date().allow(null).allow(""),
    gender: Joi.string()
      .valid(["male", "female", "other"])
      .allow(null)
      .allow("")
      .allow(""),
    password: Joi.string().required(),
    confirmPassword: Joi.string().allow(null).allow(""),
    email: Joi.string().email().allow(null).allow(""),
    phone: Joi.string().required(),
    avatarId: Joi.number().integer().allow(null).allow(""),
    roleId: Joi.number().integer().allow(null).allow(""),
    position: Joi.string()
      .valid(["admin", "management", "staff"])
      .allow(null)
      .allow(""),
    address: Joi.string().allow(null).allow(""),
  }).options({ allowUnknown: true });

  const result = Joi.validate(body, validSchema);

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

export async function updateValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    username: Joi.string().max(30).required(),
    fullName: Joi.string().max(30).required(),
    birthday: Joi.string().allow(null).allow(""),
    gender: Joi.string()
      .valid(["male", "female", "other"])
      .allow(null)
      .allow("")
      .allow(""),
    password: Joi.string().required(),
    confirmPassword: Joi.string().allow(null).allow(""),
    email: Joi.string().email().allow(null).allow(""),
    phone: Joi.string().required(),
    avatarId: Joi.number().integer().allow(null).allow(""),
    roleId: Joi.number().integer().allow(null).allow(""),
    position: Joi.string()
      .valid(["admin", "management", "staff"])
      .allow(null)
      .allow(""),
    address: Joi.string().allow(null).allow(""),
  }).options({ allowUnknown: true });

  const result = Joi.validate(body, validSchema);
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

export function resetPasswordValidator(req, res, next) {
  const { body } = req;
  const validSchema = Joi.object().keys({
    userId: Joi.number().integer().required(),
    newPassword: Joi.string().max(20).required(),
  });

  const result = Joi.validate(body, validSchema);

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

export async function updateStatusValidator(req, res, next) {
  const { body } = req;
  const schema = Joi.object().keys({
    status: Joi.string().valid(["active", "inactive"]).required(),
  });
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
