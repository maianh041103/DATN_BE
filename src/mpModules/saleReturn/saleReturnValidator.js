const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");

const createSchema = Joi.object().keys({
    branchId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    customerId: Joi.number().integer().required(),
    orderId: Joi.number().integer().required(),
    discount: Joi.number().integer().allow(null),
    returnFee: Joi.number().integer().allow(null),
    paid: Joi.number().integer().allow(null),
    description: Joi.string().allow(null).allow(""),
    paymentType: Joi.string().valid("CASH", "BANK", "DEBT").allow(null),
    products: Joi.array()
        .items(
            {
                productId: Joi.number().integer().required(),
                price: Joi.number().integer().min(0).required(),
                quantity: Joi.number().integer().required(),
                productUnitId: Joi.number().integer().required(),
                batches: Joi.array().items(
                    Joi.object().keys({
                        id: Joi.number().integer().required(),
                        quantity: Joi.number().integer().required()
                    })
                ).allow([])
            }
        ),
    listSeri: Joi.array().allow(null)
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