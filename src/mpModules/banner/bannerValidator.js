const { respondWithError } = require('../../helpers/response');

const BaseJoi = require('@hapi/joi');
const Extension = require('@hapi/joi-date');

const Joi = BaseJoi.extend(Extension);

const { ERROR_CODE_INVALID_PARAMETER } = require('../../helpers/errorCodes');

const bannerSchema = Joi.object().keys({
    title: Joi.string().max(255).required(),
    description: Joi.string().max(255).required(),
    alt: Joi.string().max(255).allow(null).allow(''),
    link: Joi.string().max(255).allow(null).allow(''),
    imageId: Joi.number().integer().allow(null).allow(''),
    displayOrder: Joi.number().integer().min(0).allow(null).allow(''),
    sponsor: Joi.string().max(255).required(),
    status: Joi.number().integer().min(0).allow(null).allow(''),
    type: Joi.string().allow(null).allow(''),
});

export async function createValidator(req, res, next) {
    const { body } = req;
    const result = Joi.validate(body, bannerSchema);

    if (result.error) {
        res.json(respondWithError(ERROR_CODE_INVALID_PARAMETER, result.error.message, result.error.details));
        return;
    }
    next();
}
