const _ = require("lodash");
const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

const createSchemaValidator = Joi.object().keys({
  branchId: Joi.number().integer().required(),
  name: Joi.string().required(),
  code: Joi.string().allow(null).allow(""),
  description: Joi.string().allow(null).allow(""),
  positionId: Joi.number().allow(null).allow(""),
  weight: Joi.string().allow(null).allow(""),
  status: Joi.number().integer().allow(null).allow(""),
  imageId: Joi.number().integer().allow(null).allow(""),
  displayOrder: Joi.number().integer().min(0).allow(null).allow(""),
  ingredientProducts: Joi.array()
    .items(
      Joi.object()
        .keys({
          productId: Joi.number().integer().required(),
          productUnitId: Joi.number().integer().required(),
          dosage: Joi.string().allow(null).allow(""),
          quantity: Joi.number().integer().min(1).required(),
            price: Joi.number().integer().min(1).required()
        })
        .required()
    )
    .required([]),
});

export async function samplePrescriptionValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, createSchemaValidator);
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
