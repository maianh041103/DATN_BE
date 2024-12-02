import { respondWithError } from "../../helpers/response";

const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");

const Joi = BaseJoi.extend(Extension);

const { ERROR_CODE_INVALID_PARAMETER } = require("../../helpers/errorCodes");

const createSchema = Joi.object().keys({
    name: Joi.string().trim().required(),
    description: Joi.string().allow(null).allow("")
});

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
