const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { moveStatus } = require("./constant");
const _ = require("lodash");

const createSchema = Joi.object().keys({
    code: Joi.string().max(255).allow(null).allow(""),
    fromBranchId: Joi.number().integer().required(),
    toBranchId: Joi.number().integer().required(),
    movedBy: Joi.number().integer().required(),
    totalItem: Joi.number().integer().min(0).required(),
    totalPrice: Joi.number().integer().min(0).allow(null),
    note: Joi.string().allow(null).allow(""),
    products: Joi.array()
        .items(
            Joi.object()
                .keys({
                    productId: Joi.number().integer().required(),
                    quantity: Joi.number().integer().required(),
                    productUnitId: Joi.number().integer().required(),
                    price: Joi.number().integer().allow(null),
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

const receiveSchema = Joi.object().keys({
    branchId: Joi.number().integer().required(),
    receivedBy: Joi.number().integer().required(),
    note: Joi.string().allow(null).allow(""),
    items: Joi.array()
        .items(
            Joi.object()
                .keys({
                    id: Joi.number().integer().required(),
                    totalQuantity: Joi.number().integer().allow(null),
                    batches: Joi.array()
                        .items(
                            Joi.object()
                                .keys({
                                    id: Joi.number().integer().required(),
                                    name: Joi.string().allow(null).allow(""),
                                    quantity: Joi.number().integer().required(),
                                    expiryDate: Joi.string().allow(null).allow(""),
                                })
                                .allow(null).allow("")
                        )
                        .allow([]),
                })
                .unknown(true)
        )
        .required([])
});

export function receiveValidator(req, res, next) {
    const { body } = req;
    const result = Joi.validate(body, receiveSchema);
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
