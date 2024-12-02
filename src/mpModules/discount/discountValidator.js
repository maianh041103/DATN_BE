import { respondWithError } from "../../helpers/response";
const discountContant = require("./discountContant");

const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");

const Joi = BaseJoi.extend(Extension);

const { ERROR_CODE_INVALID_PARAMETER } = require("../../helpers/errorCodes");

const createSchema = Joi.object().keys({
    code: Joi.string().max(50).allow(""),
    name: Joi.string().max(50).required(),
    status: Joi.string().valid([
        discountContant.discountStatus.ACTIVE,
        discountContant.discountStatus.INACTIVE,
        "ACTIVE", "INACTIVE"
    ]),
    note: Joi.string().allow(""),
    target: Joi.string().required().valid([
        discountContant.discountTarget.ORDER,
        discountContant.discountTarget.PRODUCT,
        "ORDER",
        "PRODUCT"
    ]),
    type: Joi.string().required().valid([
        discountContant.discountType.GIFT,
        discountContant.discountType.LOYALTY,
        discountContant.discountType.ORDER_PRICE,
        discountContant.discountType.PRICE_BY_BUY_NUMBER,
        discountContant.discountType.PRODUCT_PRICE,
        "GIFT", "LOYALTY", "ORDER_PRICE", "PRICE_BY_BUY_NUMBER", "PRODUCT_PRICE"
    ]),
    isMultiple: Joi.boolean().default(false),
    items: Joi.array().items(
        Joi.object({
            condition: Joi.object({
                product: Joi.object({
                    from: Joi.number().integer()
                }),
                order: Joi.object({
                    from: Joi.number().integer()
                }),
                productUnitId: Joi.array().items(
                    Joi.number().integer()
                ),
                groupId: Joi.array().items(
                    Joi.number().integer()
                )
            }),
            apply: Joi.object({
                discountValue: Joi.number().integer(),
                discountType: Joi.valid([
                    discountContant.discountDiscountType.AMOUNT,
                    discountContant.discountDiscountType.PERCENT,
                    "AMOUNT", "PERCENT"
                ]),
                isGift: Joi.boolean(),
                maxQuantity: Joi.number().integer(),
                productUnitId: Joi.array().items(
                    Joi.number().integer()
                ),
                groupId: Joi.array().items(
                    Joi.number().integer()
                ),
                pointType: Joi.valid([
                    discountContant.discountDiscountType.AMOUNT,
                    discountContant.discountDiscountType.PERCENT,
                    "AMOUNT", "PERCENT"
                ]),
                pointValue: Joi.number().integer(),
                changeType: Joi.valid([
                    discountContant.discountDiscountType.TYPE_DISCOUNT,
                    discountContant.discountDiscountType.TYPE_PRICE,
                    "TYPE_DISCOUNT", "TYPE_PRICE"
                ]),
                fixedPrice: Joi.number().integer()
            })
        }).required()
    ),
    time: Joi.object({
        dateFrom: Joi.date().required(),
        dateTo: Joi.date().required(),
        byDay: Joi.array().items(
            Joi.number().integer()
        ),
        byMonth: Joi.array().items(
            Joi.number().integer()
        ),
        byHour: Joi.array().items(
            Joi.number().integer()
        ),
        byWeekDay: Joi.array().items(
            Joi.number().integer()
        ),
        isWarning: Joi.boolean(),
        isBirthday: Joi.boolean(),
        birthdayType: Joi.valid([
            discountContant.discountBirthday.DAY,
            discountContant.discountBirthday.MONTH,
            discountContant.discountBirthday.WEEK,
            "DAY", "MONTH", "WEEK"
        ])
    }),
    scope: Joi.object({
        branch: Joi.object({
            isAll: Joi.boolean(),
            ids: Joi.array().items(Joi.number())
        }),
        customer: Joi.object({
            isAll: Joi.boolean(),
            ids: Joi.array().items(Joi.number())
        }),
        channel: Joi.object({
            isAll: Joi.boolean(),
            ids: Joi.array().items(Joi.number())
        })
    }).required()
}).options({ allowUnknown: true });

export function createValidator(req, res, next) {
    const { body } = req;
    const result = Joi.validate(body, createSchema);
    if (result.error) {
        res.json(
            respondWithError(
                ERROR_CODE_INVALID_PARAMETER,
                result.error.message,
                result.error.details
            )
        );
        return;
    }
    next();
}