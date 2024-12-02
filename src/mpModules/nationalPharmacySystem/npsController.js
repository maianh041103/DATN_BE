const _ = require("lodash");
const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  createNps,
  indexNps,
  readNps,
  updateNps,
  deleteNps,
} = require("./npsService");

const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function createController(req, res) {
  try {
    const { loginUser = {} } = req;
    const payload = {
      code: _.get(req, "body.code", null),
      username: _.get(req, "body.username", null),
      password: _.get(req, "body.password", null),
      branchId: _.get(req, "body.branchId", null),
      storeId: loginUser.storeId,
      createdBy: loginUser.id,
      updatedBy: loginUser.id,
    };
    const result = await createNps(payload, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexController(req, res) {
  try {
    const result = await indexNps(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function readController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await readNps(id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteNps(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function updateController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const code = _.get(req, "body.code", null);
    const username = _.get(req, "body.username", null);
    const password = _.get(req, "body.password", null);
    const note = _.get(req, "body.note", "");
    const status = _.get(req, "body.status", 0);
    const isAutoHandle = _.get(req, "body.isAutoHandle", 0);
    const updatedBy = _.get(req, "loginUser.id", null);
    const data = {
      ...(code && { code }),
      ...(username && { username }),
      ...(password && { password }),
      ...(note && { note }),
      ...(typeof status !== undefined && { status }),
      ...(typeof isAutoHandle !== undefined && { isAutoHandle }),
      ...(updatedBy && { updatedBy }),
    };
    const result = await updateNps(id, data, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error)
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
