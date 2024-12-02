const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);

const { HttpStatusCode } = require("../../helpers/errorCodes");

const notifySchema = Joi.object().keys({
  listUser: Joi.array().allow(null).allow([]).optional(),
  listCustomer: Joi.array().allow(null).allow([]).optional(),
  userId: Joi.number().integer().allow(null).optional(),
  customerId: Joi.number().integer().allow(null).optional(),
  parentId: Joi.number().allow(null).optional(),
  role: Joi.string().max(255).allow(null, "").optional(),
  title: Joi.string().max(255).required(),
  description: Joi.string().max(255).allow(null, "").optional(),
  content: Joi.string().allow(null, "").optional(),
  type: Joi.string().max(255).allow(null, "").optional(),
  url: Joi.string().allow(null, "").required(),
  iconId: Joi.number().integer().allow(null).optional(),
  objectId: Joi.number().integer().allow(null).optional(),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, notifySchema);
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
