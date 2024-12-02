const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { inboundStatus } = require("./inboundConstant");

const createSchema = Joi.object().keys({
  code: Joi.string().max(255).allow(null).allow(""),
  branchId: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
  supplierId: Joi.number().integer().required(),
  totalPrice: Joi.number().integer().min(0).required(),
  discount: Joi.number().integer().allow(null),
  paid: Joi.number().integer().allow(null),
  debt: Joi.number().integer().allow(null),
  description: Joi.string().max(512).allow(null).allow(""),
  status: Joi.string().valid([inboundStatus.DRAFT, inboundStatus.SUCCEED]).required(),  
  products: Joi.array()
    .items(
      Joi.object()
        .keys({
          productId: Joi.number().integer().required(),
          importPrice: Joi.number().integer().min(0).required(),
          totalQuantity: Joi.number().integer().required(),
          totalPrice: Joi.number().integer().min(0).required(),
          discount: Joi.number().integer().allow(null),
          productUnitId: Joi.number().integer().required(),
          batches: Joi.array()
          .items(
            Joi.object()
              .keys({
                id: Joi.number().integer().required(),
                quantity: Joi.number().integer().required(),
                expiryDate: Joi.string().allow(null).allow(""),
              })
              .allow(null).allow("")
          )
          .allow([]),
        })
        .unknown(true)
    )
    .required([]),
});

export function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, createSchema);
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

const updateStatusSchema = Joi.object().keys({
  status: Joi.string().valid([inboundStatus.DRAFT, inboundStatus.SUCCEED, inboundStatus.CANCELLED]).required(),  
});

export function updateStatusValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, updateStatusSchema);
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
