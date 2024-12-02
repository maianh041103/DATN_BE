const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

const schema = Joi.object().keys({
  branchId: Joi.number().integer().required(),
  productId: Joi.number().integer().required(),
  name: Joi.string().max(512).required(),
  expiryDate: Joi.date().format('YYYY-MM-DD').required(),
  quantity: Joi.number().integer().min(1).required(),
  oldQuantity: Joi.number().integer().min(1).allow(null),
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
