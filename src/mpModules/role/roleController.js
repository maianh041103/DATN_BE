const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  getRoleDetail,
  indexRoles,
  updateRole,
  createRole,
  deleteRoleById,
} = require("./roleService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function getList(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexRoles({
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

export async function create(req, res) {
  try {
    const { loginUser = {} } = req;
    const role = {
      name: _.get(req, "body.name", ""),
      description: _.get(req, "body.description", ""),
      permissions: _.get(req, "body.permissions", []),
      createdBy: loginUser.id,
      updatedBy: loginUser.id,
      storeId: loginUser.storeId,
    };
    const result = await createRole(role);
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
    const { loginUser = {} } = req;
    const result = await getRoleDetail(id, loginUser.storeId);
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
    const { loginUser = {} } = req;
    const role = {
      name: _.get(req, "body.name", ""),
      description: _.get(req, "body.description", ""),
      permissions: _.get(req, "body.permissions", []),
      updatedBy: loginUser.id,
      warehouse: _.get(req, "body.warehouse", null),
    };
    const result = await updateRole(id, role, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteRoleById(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
