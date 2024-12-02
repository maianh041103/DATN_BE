const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readGroupCustomer,
  indexGroupCustomers,
  updateGroupCustomer,
  createGroupCustomer,
  deleteGroupCustomerById,
} = require("./groupCustomerService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexGroupCustomersController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexGroupCustomers({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function createController(req, res) {
  try {
    const { loginUser = {} } = req;
    const groupCustomer = {
      name: _.get(req, "body.name", ""),
      description: _.get(req, "body.description", ""),
      type: _.get(req, "body.type", ""),
      discount: _.get(req, "body.discount", 0),
      storeId: loginUser.storeId,
      createdBy: loginUser.id,
      updatedBy: loginUser.id,
    };
    const result = await createGroupCustomer(groupCustomer);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function readController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await readGroupCustomer(req.params.id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function updateController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const groupCustomer = {
      name: _.get(req, "body.name", ""),
      description: _.get(req, "body.description", ""),
      type: _.get(req, "body.type", ""),
      discount: _.get(req, "body.discount", 0),
      updatedBy: loginUser.id,
    };
    const result = await updateGroupCustomer(id, groupCustomer, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function deleteController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteGroupCustomerById(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}
