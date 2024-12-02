const _ = require("lodash");
const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  insertContactWork,
  fetchContactWorkList,
  getContactWorkDetail,
  updateContactWork,
  deleteContactWorkById,
} = require("./contactWorkService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function createController(req, res) {
  try {
    const credentials = {
      name: req.body && req.body.name ? req.body.name : null,
      phone: req.body && req.body.phone ? req.body.phone : null,
      email: req.body && req.body.email ? req.body.email : null,
      content: req.body && req.body.content ? req.body.content : null,
      createdAt: new Date(),
    };
    const result = await insertContactWork(credentials);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getList(req, res) {
  try {
    const result = await fetchContactWorkList(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getDetail(req, res) {
  try {
    const { id } = req.params;
    const result = await getContactWorkDetail(id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteContactWork(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteContactWorkById(id);
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
    const data = {
      note: _.get(req, "body.note", ""),
      status: _.get(req, "body.status", 0),
      updatedBy: _.get(req, "loginUser.id", null),
    };
    const result = await updateContactWork(id, data);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
