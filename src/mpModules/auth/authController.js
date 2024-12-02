const _ = require("lodash");
const {
  login,
  createAccount,
  updatePassword,
  readUserProfile,
  updateUserProfile,
  checkEmail,
  checkOtp,
  changePassword
} = require("./authService");
const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function loginController(req, res) {
  try {
    const result = await login({
      username: _.get(req.body, 'username', null),
      password: _.get(req.body, 'password', null),
    });
    if (result.success)
      res.json(respondItemSuccess(result.data, result.message));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function registerController(req, res) {
  try {
    const result = await createAccount(req.body);
    if (result.success)
      res.json(respondItemSuccess(result.data, result.message));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function changePasswordController(req, res) {
  try {
    const { loginUser = {} } = req;
    const credentials = {
      oldPassword: req.body ? req.body.oldPassword : null,
      newPassword: req.body ? req.body.newPassword : null,
      reNewPassword: req.body ? req.body.reNewPassword : null,
      userId: loginUser.id,
    };

    const result = await updatePassword(credentials);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function readUserProfileController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await readUserProfile(loginUser.id);
    if (result.success)
      res.json(respondItemSuccess(result.data, result.message));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function updateUserProfileController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await updateUserProfile(loginUser.id, req.body);
    if (result.success)
      res.json(respondItemSuccess(result.data, result.message));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function fillEmailController(req, res) {
  try {
    const result = await checkEmail({
      email: req.body.email
    });
    if (result.success)
      res.json(respondItemSuccess(result.data, result.message));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function fillOtpController(req, res) {
  try {
    const result = await checkOtp({
      email: req.body.email,
      otp: req.body.otp
    });
    if (result.success)
      res.json(respondItemSuccess(result.data, result.message));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function changePasswordFPController(req, res) {
  try {
    const result = await changePassword({
      email: req.body.email,
      newPassword: req.body.newPassword,
      reNewPassword: req.body.reNewPassword,
    });
    if (result.success)
      res.json(respondItemSuccess(result.data, result.message));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
