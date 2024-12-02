const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  indexMedicationCategories,
  createMedicationCategory,
  deleteMedicationCategory,
  updateMedicationCategory,
  readMedicationCategoryByCode,
} = require("./medicationCategoryService");
const { ERROR_CODE_SYSTEM_ERROR } = require("../../helpers/errorCodes");

// Get medication category list
export async function indexController(req, res) {
  try {
    const result = await indexMedicationCategories(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(ERROR_CODE_SYSTEM_ERROR, error.message, error));
  }
}

// Post medication category
export async function createController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await createMedicationCategory(req.body, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(ERROR_CODE_SYSTEM_ERROR, error.message, error));
  }
}

// Update medication category
export async function updateController(req, res) {
  try {
    const { loginUser = {} } = req;
    const id = req.params ? req.params.id : null;
    const credentials = {
      id,
      ...req.body
    };
    const result = await updateMedicationCategory(credentials, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(ERROR_CODE_SYSTEM_ERROR, error.message, error));
  }
}

// Delete medication category
export async function deleteController(req, res) {
  try {
    const id = req.params ? req.params.id : null;
    const result = await deleteMedicationCategory(id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(ERROR_CODE_SYSTEM_ERROR, error.message, error));
  }
}

export async function readByCodeController(req, res) {
  try {
    const { code } = req.params;
    const result = await readMedicationCategoryByCode(code);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}