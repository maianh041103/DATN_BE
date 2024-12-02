const _ = require("lodash");
const { hashPassword } = require("../auth/authService");
const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  indexUsers,
  createUser,
  deleteUserById,
  updateUser,
  readUser,
  updatePassword,
  updateUserStatus,
} = require("./userService");
const { formatMobileToSave } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexUsersController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexUsers({
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
    const result = await createUser({
      username: _.get(req, "body.username", ""),
      fullName: _.get(req, "body.fullName", ""),
      email: _.get(req, "body.email", ""),
      birthday: _.get(req, "body.birthday", ""),
      gender: _.get(req, "body.gender", ""),
      phone: formatMobileToSave(_.get(req, "body.phone", "")),
      password: _.get(req, "body.password", ""),
      position: _.get(req, "body.position", ""),
      roleId: _.get(req, "body.roleId", null),
      storeId: loginUser.storeId,
      avatarId: _.get(req, "body.avatarId", null),
      address: _.get(req, "body.address", ""),
      isAdmin: _.get(req, "body.isAdmin", false),
      createdBy: loginUser.id,
    }, req.body.listBranchId || []);
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
    const result = await readUser(id, loginUser);
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
    const result = await updateUser(
      id,
      {
        username: _.get(req, "body.username", ""),
        fullName: _.get(req, "body.fullName", ""),
        email: _.get(req, "body.email", ""),
        birthday: _.get(req, "body.birthday", ""),
        gender: _.get(req, "body.gender", ""),
        phone: formatMobileToSave(_.get(req, "body.phone", "")),
        password: _.get(req, "body.password", ""),
        position: _.get(req, "body.position", ""),
        roleId: _.get(req, "body.roleId", null),
        listBranchId: _.get(req, "body.listBranchId", null),
        avatarId: _.get(req, "body.avatarId", null),
        address: _.get(req, "body.address", ""),
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

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const user = {
      status: _.get(req, "body.status", ""),
      updatedBy: loginUser.id,
    };
    const result = await updateUserStatus(id, user);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteUserById(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function resetPassword(req, res) {
  try {
    const { userId, newPassword } = req.body;
    const { loginUser = {} } = req;
    const result = await updatePassword(userId, newPassword, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
