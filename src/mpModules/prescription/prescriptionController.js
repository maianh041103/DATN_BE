const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readPrescription,
  indexPrescriptions,
  updatePrescription,
  createPrescription,
  deletePrescription,
} = require("./prescriptionService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexPrescriptions({
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
    const result = await createPrescription({
      doctorId: _.get(req, "body.doctorId", null),
      name: _.get(req, "body.name", ""),
      code: _.get(req, "body.code", ""),
      gender: _.get(req, "body.gender", ""),
      age: _.get(req, "body.age", ""),
      weight: _.get(req, "body.weight", ""),
      identificationCard: _.get(req, "body.identificationCard", ""),
      healthInsuranceCard: _.get(req, "body.healthInsuranceCard", ""),
      address: _.get(req, "body.address", ""),
      supervisor: _.get(req, "body.supervisor", ""),
      diagnostic: _.get(req, "body.diagnostic", ""),
      phone: _.get(req, "body.phone", ""),
      branchId: _.get(req, "body.branchId", null),
      healthFacilityId: _.get(req, "body.healthFacilityId", null),
      storeId: loginUser.storeId,
      createdBy: loginUser.id,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await readPrescription(req.params.id, loginUser);
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
    const result = await updatePrescription(
      id,
      {
        doctorId: _.get(req, "body.doctorId", null),
        healthFacilityId: _.get(req, "body.healthFacilityId", null),
        name: _.get(req, "body.name", ""),
        code: _.get(req, "body.code", ""),
        gender: _.get(req, "body.gender", ""),
        age: _.get(req, "body.age", ""),
        weight: _.get(req, "body.weight", ""),
        identificationCard: _.get(req, "body.identificationCard", ""),
        healthInsuranceCard: _.get(req, "body.healthInsuranceCard", ""),
        address: _.get(req, "body.address", ""),
        supervisor: _.get(req, "body.supervisor", ""),
        diagnostic: _.get(req, "body.diagnostic", ""),
        phone: _.get(req, "body.phone", ""),
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

export async function deleteController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deletePrescription(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
