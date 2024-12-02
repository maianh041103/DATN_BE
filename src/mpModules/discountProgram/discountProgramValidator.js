const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const productSchema = Joi.object().keys({
  productId: Joi.number().integer().required(),
  percentDiscount: Joi.number().integer().required(),
});

const discountProgramSchema = Joi.object().keys({
  products: Joi.array().items(productSchema).allow([]),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  listCustomer: Joi.array().allow([]),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, discountProgramSchema);
  if (result.error) {
    res.json(
      respondWithError(
        HttpStatusCode.SYSTEM_ERROR,
        result.error.message,
        result.error.details
      )
    );
    return;
  }
  next();
}
