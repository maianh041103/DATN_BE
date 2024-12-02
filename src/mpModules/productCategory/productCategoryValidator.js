const _ = require("lodash");
const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);

const { HttpStatusCode } = require("../../helpers/errorCodes");

const introduction = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().allow(null).allow(""),
  order: Joi.number().integer().min(0).allow(null).allow(""),
  imageId: Joi.string().allow(null).allow(""),
});

export async function productCategoryValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, introduction);
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
