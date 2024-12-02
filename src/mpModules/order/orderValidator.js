const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { productTypes } = require("../product/productConstant");

const createSchema = Joi.object().keys({
  userId: Joi.number().integer().required(),
  customerId: Joi.number().integer().allow(null),
  branchId: Joi.number().integer().required(),
  prescriptionId: Joi.number().integer().allow(null).allow(""),
  paymentType: Joi.string().valid(["CASH", "BANK", "DEBT"]).required(),
  description: Joi.string().max(512).allow(null).allow(""),
  discount: Joi.number().integer().allow(null),
  discountType: Joi.string().valid([1, 2]).allow(null).allow(""), // percent - money
  discountOrder: Joi.number().integer().allow(null),
  listDiscountId: Joi.array().items(Joi.number().integer()),
  cashOfCustomer: Joi.number().integer().allow(null),
  products: Joi.array()
    .items(
      Joi.object()
        .keys({
          productUnitId: Joi.number().integer().required(),
          originProductUnitId: Joi.number().integer().required(),
          productId: Joi.number().integer().required(),
          batches: Joi.array().items(
            Joi.object().keys({
              id: Joi.number().integer().required(),
              quantity: Joi.number().integer().min(1).required(),
            }).allow({}).allow(null)
          ).required().allow([]),
          productType: Joi.number()
            .valid([
              productTypes.THUOC,
              productTypes.HANGHOA,
              productTypes.COMBO,
              productTypes.DONTHUOC,
            ])
            .required(), // Thuốc - Hàng hóa - Combo - Đơn thuốc mẫu
          quantity: Joi.number().integer().min(1).required(),
          isDiscount: Joi.boolean(),
          itemPrice: Joi.number().integer(),
          discountPrice: Joi.number().integer(),
          pointProduct: Joi.number().integer().allow(null)
        })
        .required(),
    )
    .required([]),
  totalPrice: Joi.number().integer().required(),
  paymentPoint: Joi.number().integer().allow(null),
  pointOrder: Joi.number().integer().allow(null)
});

export function createValidator(req, res, next) {
  const { body } = req;
  // let createSchemaTmp = createSchema;
  // if (body && body.paymentType && body.paymentType == "BANK") {
  //   createSchemaTmp = createSchemaBank;
  // }

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

const updateSchema = Joi.object().keys({
  userId: Joi.number().integer().required(),
  customerId: Joi.number().integer().allow(null),
  branchId: Joi.number().integer().required(),
  prescriptionId: Joi.number().integer().allow(null).allow(""),
  paymentType: Joi.string().valid(["CASH", "BANK", "DEBT"]).required(),
  description: Joi.string().max(512).allow(null).allow(""),
  discount: Joi.number().integer().allow(null),
  discountType: Joi.string().valid([1, 2]).allow(null).allow(""), // percent - money
  cashOfCustomer: Joi.number().integer().allow(null),
  products: Joi.array()
    .items(
      Joi.object()
        .keys({
          productUnitId: Joi.number().integer().required(),
          originProductUnitId: Joi.number().integer().required(),
          productId: Joi.number().integer().required(),
          productType: Joi.number()
            .valid([
              productTypes.THUOC,
              productTypes.HANGHOA,
              productTypes.COMBO,
              productTypes.DONTHUOC,
            ])
            .required(), // Thuốc - Hàng hóa - Combo - Đơn thuốc mẫu
          quantity: Joi.number().integer().min(1).required(),
          isDiscount: Joi.boolean(),
          itemPrice: Joi.number().integer(),
          discountPrice: Joi.number().integer(),
          pointProduct: Joi.number().integer().allow(null)
        })
        .required([]),
    )
    .required([]),
  totalPrice: Joi.number().integer().required(),
  paymentPoint: Joi.number().integer().allow(null),
  pointOrder: Joi.number().integer().allow(null),
  shippingAddress: Joi.object()
    .keys({
      detailAddress: Joi.string().max(255).required(),
      email: Joi.string().max(255).allow(null).allow(""),
      receiver: Joi.string().max(255).required(),
      phone: Joi.string().max(255).required(),
      provinceId: Joi.number().positive().required(),
      districtId: Joi.number().positive().required(),
      wardId: Joi.number().positive().required(),
    })
    .required([]),
});

const updateSchemaBank = Joi.object().keys({
  statusId: Joi.number().integer().required(),
  paymentType: Joi.string().valid(["BANK", "COD"]).required(),
  description: Joi.string().max(255).allow(null).allow(""),
  paidAmount: Joi.number().integer().allow(null),
  products: Joi.array()
    .items(
      Joi.object().keys({
        productId: Joi.number().integer().required(),
        productType: Joi.string().valid(["product", "combo"]).required(),
        quantity: Joi.number().integer().required(),
        customerId: Joi.number().integer().allow(null).allow(""),
        price: Joi.number().integer().allow(null).allow(""),
      })
    )
    .required([]),
  shippingAddress: Joi.object()
    .keys({
      detailAddress: Joi.string().max(255).allow(null).allow(""),
      email: Joi.string().max(255).allow(null).allow(""),
      receiver: Joi.string().max(255).required(),
      phone: Joi.string().max(255).required(),
      provinceId: Joi.number().integer().allow(null).allow(""),
      districtId: Joi.number().integer().allow(null).allow(""),
      wardId: Joi.number().integer().allow(null).allow(""),
    })
    .required([]),
  totalPrice: Joi.number().integer(),
});

const createSchemaBank = Joi.object().keys({
  customerId: Joi.number().integer().required(),
  paymentType: Joi.string().valid(["CASH", "BANK", "DEBT"]).required(),
  description: Joi.string().max(255).allow(null).allow(""),
  paidAmount: Joi.number().integer().allow(null),
  products: Joi.array()
    .items(
      Joi.object()
        .keys({
          productUnitId: Joi.number().integer().required(),
          productId: Joi.number().integer().required(),
          productType: Joi.number()
            .valid([
              productTypes.THUOC,
              productTypes.HANGHOA,
              productTypes.COMBO,
              productTypes.DONTHUOC,
            ])
            .required(), // Thuốc - Hàng hóa - Combo - Đơn thuốc mẫu
          quantity: Joi.number().integer().required(),
        })
        .unknown(true)
    )
    .required([]),
  shippingAddress: Joi.object()
    .keys({
      detailAddress: Joi.string().max(255).allow(null).allow(""),
      email: Joi.string().max(255).allow(null).allow(""),
      receiver: Joi.string().max(255).required(),
      phone: Joi.string().max(255).required(),
      provinceId: Joi.number().integer().allow(null).allow(""),
      districtId: Joi.number().integer().allow(null).allow(""),
      wardId: Joi.number().integer().allow(null).allow(""),
    })
    .required([]),
  totalPrice: Joi.number().integer(),
  listEndDate: Joi.object().allow({}).allow(null),
});

export async function updateValidator(req, res, next) {
  const { body } = req;
  // let updateSchemaTmp = updateSchema;
  // if (body && body.paymentType && body.paymentType == "BANK") {
  //   updateSchemaTmp = updateSchemaBank;
  // }
  const result = Joi.validate(body, updateSchema);

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
    status: Joi.number().integer().required(),
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
