const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  indexProvinces,
  indexDistricts,
  indexWards,
} = require("./addressService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

// Get list province
export async function indexProvincesController(req, res) {
  try {
    const result = await indexProvinces(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

// Get list district
export async function indexDistrictsController(req, res) {
  try {
    const { provinceId } = req.params;
    const result = await indexDistricts(provinceId, req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

// Get list ward
export async function indexWardsController(req, res) {
  try {
    const { provinceId, districtId } = req.params;
    const result = await indexWards(provinceId, districtId, req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
