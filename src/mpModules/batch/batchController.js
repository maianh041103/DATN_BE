const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readBatch,
  indexBatches,
  updateBatch,
  createBatch,
  deleteBatch,
} = require("./batchService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexBatches({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error)
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await createBatch({
      name: _.get(req, "body.name", ""),
      expiryDate: _.get(req, "body.expiryDate", ""),
      quantity: _.get(req, "body.quantity", ""),
      branchId: _.get(req, "body.branchId", null),
      productId: _.get(req, "body.productId", null),
      storeId: loginUser.storeId,
      createdBy: loginUser.id,
      updatedBy: loginUser.id,
    }, loginUser);
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
    const result = await readBatch(req.params.id, loginUser);
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
    const result = await updateBatch(
      id,
      {
        branchId: _.get(req, "body.branchId", null),
        productId: _.get(req, "body.productId", null),
        name: _.get(req, "body.name", ""),
        expiryDate: _.get(req, "body.expiryDate", ""),
        quantity: _.get(req, "body.quantity", ""),
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
    const result = await deleteBatch(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
