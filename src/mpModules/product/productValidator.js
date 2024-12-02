const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { productStatuses, productPriceSettingTypes } = require("./productConstant");

const mediaSchema = Joi.object().keys({
  id: Joi.number().integer().required(),
  isThumbnail: Joi.boolean().allow(null).allow(""),
});

// Thuốc
const productSchema = Joi.object().keys({
  branchId: Joi.number().integer().required(),
  name: Joi.string().max(255).required(),
  shortName: Joi.string().max(255).allow(null).allow(""),
  code: Joi.string().max(255).allow(null).allow(""),
  barCode: Joi.string().max(255).allow(null).allow(""),
  groupProductId: Joi.number().integer().allow(null).allow(""),
  primePrice: Joi.number().integer().allow(null).allow(""),
  price: Joi.number().integer().required(),
  weight: Joi.string().allow(null).allow(""),
  warningExpiryDate: Joi.string().allow(null).allow(""),
  warningExpiryText: Joi.string().allow(null).allow(""),
  isDirectSale: Joi.boolean().allow(null).allow(""),
  registerNumber: Joi.string().allow(null).allow(""),
  activeElement: Joi.string().allow(null).allow(""),
  content: Joi.string().allow(null).allow(""),
  packingSpecification: Joi.string().allow(null).allow(""),
  manufactureId: Joi.number().integer().allow(null).allow(""),
  countryId: Joi.number().integer().allow(null).allow(""),
  imageId: Joi.number().integer().allow(null).allow(""),
  imageUrl: Joi.string().allow(null).allow(""),
  type: Joi.number().integer().required(),
  minInventory: Joi.number().integer().allow(null).allow(""),
  maxInventory: Joi.number().integer().allow(null).allow(""),
  description: Joi.string().allow(null).allow(""),
  note: Joi.string().allow(null).allow(""),
  isLoyaltyPoint: Joi.boolean().allow(null).allow(""),
  isBatchExpireControl: Joi.boolean().allow(null).allow(""),
  expiryPeriod: Joi.number().integer().allow(null).allow(""),
  status: Joi.number().integer().min(0).allow(null).allow(""),
  inventory: Joi.number().integer().min(0).allow(null).allow(""),
  baseUnit: Joi.string().required(),
  productUnits: Joi.array().allow([]),
  dosageId: Joi.number().integer().allow(null).allow(""),
  positionId: Joi.number().integer().allow(null).allow(""),
  drugCode: Joi.string().max(255).allow(null).allow(""),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, productSchema);

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
  // // validate thumbnail of image
  // let isError = false;
  // const arrImages = body.images || [];
  // if (arrImages.length) {
  //     const thumbnails = arrImages.filter(i => i.isThumbnail);
  //     if (thumbnails.length === 0) {
  //         isError = true;
  //         const message = 'Phải có 1 ảnh đại diện';
  //         res.json(respondWithError(HttpStatusCode.BAD_REQUEST, message, {}));
  //     } else if (thumbnails.length > 1) {
  //         isError = true;
  //         const message = 'Chỉ có 1 ảnh đại diện';
  //         res.json(respondWithError(HttpStatusCode.BAD_REQUEST, message, {}));
  //     }
  // }
  // if (isError) return;
  next();
}

export async function updateStatusValidator(req, res, next) {
  const { body } = req;
  const schema = Joi.object().keys({
    status: Joi.string()
      .valid([
        productStatuses.DRAFT,
        productStatuses.ACTIVE,
        productStatuses.INACTIVE,
      ])
      .required(),
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

export async function updateEndDateValidator(req, res, next) {
  const { body } = req;
  const schema = Joi.object().keys({
    ids: Joi.array()
      .items(Joi.number().integer().allow(null).allow(""))
      .allow([])
      .required(),
    endDate: Joi.string().max(255).allow(null).allow(""),
    endMonth: Joi.number().integer().min(0).allow(null).allow(""),
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

export async function updateProductPriceSettingValidator(req, res, next) {
  const { body } = req;
  const schema = Joi.object().keys({
    branchId: Joi.number().integer().required(),
    value: Joi.number().required(),
    isApplyForAll: Joi.boolean().allow(null).allow(""),
    type: Joi.number().integer()
      .valid([
        productPriceSettingTypes.MONEY,
        productPriceSettingTypes.PERCENT,
      ])
      .required(),
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
