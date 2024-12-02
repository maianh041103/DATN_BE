const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readWorkPlace,
  indexWorkPlaces,
  updateWorkPlace,
  createWorkPlace,
  deleteWorkPlace,
} = require("./workPlaceService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexWorkPlaces({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await createWorkPlace({
      name: _.get(req, "body.name", ""),
      storeId: loginUser.storeId,
      createdBy: loginUser.id,
      updatedBy: loginUser.id,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await readWorkPlace(req.params.id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
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
    const result = await updateWorkPlace(
      id,
      {
        name: _.get(req, "body.name", ""),
        updatedBy: loginUser.id,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess());
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
    const result = await deleteWorkPlace(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
