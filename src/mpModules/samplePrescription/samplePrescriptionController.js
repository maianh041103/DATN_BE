const _ = require("lodash");
const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  indexService,
  createService,
  readService,
  deleteService,
  updateService,
  updateStatusService,
} = require("./samplePrescriptionService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexService({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error);
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function readController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await readService(id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error);
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createController(req, res) {
  try {
    const { loginUser = {} } = req;
    const ingredientProducts = _.get(req, "body.ingredientProducts", null);
    const result = await createService(
      {
        name: _.get(req, "body.name", null),
        code: _.get(req, "body.code", null),
        description: _.get(req, "body.description", ""),
        positionId: _.get(req, "body.positionId", ""),
        weight: _.get(req, "body.weight", ""),
        status: _.get(req, "body.status", null),
        imageId: _.get(req, "body.imageId", null),
        branchId: _.get(req, "body.branchId", null),
        storeId: loginUser.storeId,
        createdBy: loginUser.id,
        updatedBy: loginUser.id,
      },
      ingredientProducts,
      loginUser
    );
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
    const ingredientProducts = _.get(req, "body.ingredientProducts", null);
    const result = await updateService(
      id,
      {
        name: _.get(req, "body.name", null),
        code: _.get(req, "body.code", null),
        description: _.get(req, "body.description", ""),
        positionId: _.get(req, "body.positionId", ""),
        weight: _.get(req, "body.weight", ""),
        status: _.get(req, "body.status", null),
        imageId: _.get(req, "body.imageId", null),
        branchId: _.get(req, "body.branchId", null),
        updatedBy: loginUser.id,
      },
      ingredientProducts,
      loginUser
    );
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

// Update status
export async function updateStatusController(req, res) {
  try {
    const { loginUser = {} } = req;
    const { status } = req.body;
    const { id } = req.params;
    const result = await updateStatusService(id, status, loginUser);
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
    const result = await deleteService(id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
