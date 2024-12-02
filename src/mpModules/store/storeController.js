const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readStore,
  indexStores,
  updateStore,
  createStore,
  deleteStore,
  listStore
} = require("./storeService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexStoresController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexStores({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}
export async function ListStoresController( req,res) {
  try {
    const result = await listStore({...req.query});
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}
export async function createStoreController(req, res) {
  try {
    const result = await createStore({
      name: _.get(req.body, "name", ""),
      phone: _.get(req.body, "phone", ""),
      email: _.get(req.body, "email", ""),
      logoId: _.get(req.body, "logoId", null),
      wardId: _.get(req.body, "wardId", null),
      districtId: _.get(req.body, "districtId", null),
      provinceId: _.get(req.body, "provinceId", null),
      address: _.get(req.body, "address", ""),
      businessRegistrationImageId: _.get(req.body, "businessRegistrationImageId", null),
      businessRegistrationNumber: _.get(req.body, "businessRegistrationNumber", ""),
      createdBy: _.get(req, "loginUser.id", null),
      createdAt: new Date(),
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function readStoreController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await readStore(id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function updateStoreController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const status = _.get(req.body, "status", null);
    const store = {
      name: _.get(req.body, "name", ""),
      phone: _.get(req.body, "phone", ""),
      email: _.get(req.body, "email", ""),
      logoId: _.get(req.body, "logoId", null),
      wardId: _.get(req.body, "wardId", null),
      districtId: _.get(req.body, "districtId", null),
      provinceId: _.get(req.body, "provinceId", null),
      address: _.get(req.body, "address", ""),
      businessRegistrationImageId: _.get(req.body, "businessRegistrationImageId", null),
      businessRegistrationNumber: _.get(req.body, "businessRegistrationNumber", ""),
      ...(status !== null && { status }),
      updatedBy: loginUser.id,
      updatedAt: new Date(),
    };
    const result = await updateStore(id, store, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function deleteStoreController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteStore(id, loginUser.id);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}
