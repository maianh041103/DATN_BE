const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  fetchProductCategoryList,
  insertProductCategory,
  destroyProductCategory,
  fetchUpdateProductCategory,
} = require("./productCategoryService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

// Get product category list
export async function getProductCategoryList(req, res) {
  try {
    const result = await fetchProductCategoryList(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

// Post product category
export async function createProductCategory(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await insertProductCategory(req.body, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

// Update product category
export async function updateProductCategory(req, res) {
  try {
    const { loginUser = {} } = req;
    const id = req.params ? req.params.id : null;
    const { name, order, description } = req.body;
    const credentials = {
      id,
      name,
      order,
      description,
    };
    const result = await fetchUpdateProductCategory(credentials, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

// Delete product category
export async function deleteProductCategory(req, res) {
  try {
    const id = req.params ? req.params.id : null;
    const result = await destroyProductCategory(id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
