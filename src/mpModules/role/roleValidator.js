const { respondWithError } = require("../../helpers/response");
const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
const { HttpStatusCode } = require("../../helpers/errorCodes");
const permissionSchema = Joi.object().keys({
  action: Joi.string()
    .valid(
      "read",
      "create",
      "update",
      "delete",
      "approve",
      "reset_password",
      "view_all",
      "payment",
      "download"
    )
    .required(),
  model: Joi.string().required(),
});

const roleSchema = Joi.object().keys({
  name: Joi.string().max(255).required(),
  description: Joi.string().max(255).allow(null).allow(""),
  permissions: Joi.array().items(permissionSchema),
});

export async function createValidator(req, res, next) {
  const { body } = req;
  const result = Joi.validate(body, roleSchema);
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
