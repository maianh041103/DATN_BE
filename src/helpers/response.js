const { HttpStatusCode } = require("./errorCodes");
const _ = require("lodash");
export function respondItemSuccess(data, message = "Success") {
  return {
    code: HttpStatusCode.SUCCESS_RESPONSE,
    message,
    data,
  };
}

export function respondArraySuccess(data, totalItem, message = "Success") {
  return {
    code: HttpStatusCode.SUCCESS_RESPONSE,
    message,
    data,
    totalItem,
  };
}

export function respondWithError(errorCode, message = "Error", data = {}) {
  return {
    code: errorCode,
    message,
    errors: data,
  };
}

export function respondWithClientError(e) {
  console.log(e);
  let errorRes = {};
  try {
    errorRes = JSON.parse(e.message);
  } catch {
    errorRes = {};
  }
  if (errorRes.error) {
    return errorRes;
  }

  const { errors = [] } = e;
  const [error = {}] = errors;
  return {
    error: true,
    code: HttpStatusCode.SYSTEM_ERROR,
    message: `${e.message}: ${_.get(error, "message", "")}`,
  };
}
