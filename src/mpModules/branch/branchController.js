const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readBranch,
  indexBranches,
  updateBranch,
  createBranch,
  deleteBranch,
} = require("./branchService");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { ACTIVE } = require("../../helpers/choices");

export async function indexBranchesController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexBranches({
      ...req.query,
      storeId: loginUser.storeId
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createBranchController(req, res) {
  try {
    const { loginUser = {} } = req;
    const status = _.get(req.body, "status", ACTIVE);
    const result = await createBranch({
      name: _.get(req.body, "name", ""),
      phone: _.get(req.body, "phone", ""),
      code: _.get(req.body, "code", ""),
      zipCode: _.get(req.body, "zipCode", ""),
      wardId: _.get(req.body, "wardId", null),
      districtId: _.get(req.body, "districtId", null),
      provinceId: _.get(req.body, "provinceId", null),
      storeId: loginUser.storeId,
      ...(status !== null && { status }),
      address1: _.get(req.body, "address1", ""),
      address2: _.get(req.body, "address2", ""),
      isDefaultBranch: _.get(req.body, "isDefaultBranch", false),
      createdBy: _.get(req, "loginUser.id", null),
      createdAt: new Date(),
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function readBranchController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await readBranch(id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function updateBranchController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const status = _.get(req.body, "status", null);
    const branch = {
      name: _.get(req.body, "name", ""),
      phone: _.get(req.body, "phone", ""),
      code: _.get(req.body, "code", ""),
      zipCode: _.get(req.body, "zipCode", ""),
      wardId: _.get(req.body, "wardId", null),
      districtId: _.get(req.body, "districtId", null),
      provinceId: _.get(req.body, "provinceId", null),
      storeId: loginUser.storeId,
      address1: _.get(req.body, "address1", ""),
      address2: _.get(req.body, "address2", ""),
      isDefaultBranch: _.get(req.body, "isDefaultBranch", false),
      ...(status !== null && { status }),
      updatedBy: _.get(req, "loginUser.id", null),
      updatedAt: new Date(),
    };
    const result = await updateBranch(id, branch);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteBranchController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteBranch(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
