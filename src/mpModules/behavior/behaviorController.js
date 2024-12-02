const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readUserTracking,
  indexUsersTrack,
  updateUserTracking,
  createUserTracking,
  deleteUserTracking,
  indexUsersTracking,
} = require("./behaviorService");

const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const result = await indexUsersTrack(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function create(req, res) {
  try {
    const data = {
      accountId: _.get(req, "body.accountId", null),
      type: _.get(req, "body.type", null),
      objectId: _.get(req, "body.objectId", null),
      action: _.get(req, "body.action", ""),
      data: JSON.stringify(_.get(req, "body.data", "")),
      createdAt: new Date(),
    };
    const result = await createUserTracking(data);
    if (result.success) res.json();
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function read(req, res) {
  try {
    const { id } = req.params;
    const result = await readUserTracking(id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const result = await updateUserTracking(id, req.body);
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
    const result = await deleteUserTracking(id);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getActionHistoryList(req, res) {
  try {
    const result = await indexUsersTracking(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
