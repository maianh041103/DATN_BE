const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  getPromotionProgramDetail,
  fetchPromotionProgramList,
  updatePromotionProgram,
  createPromotionProgram,
  deletePromotionProgramById,
} = require("./promotionProgramService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function getList(req, res) {
  try {
    const result = await fetchPromotionProgramList(req.query);
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
    const data = {
      program: {
        title: _.get(req, "body.title", ""),
        slug: _.get(req, "body.slug", ""),
        alt: _.get(req, "body.alt", ""),
        imageId: _.get(req, "body.imageId", null),
        link: _.get(req, "body.link", ""),
        description: _.get(req, "body.description", ""),
        sponsor: _.get(req, "body.sponsor", ""),
        startTime: _.get(req, "body.startTime", null),
        endTime: _.get(req, "body.endTime", null),
        createdBy: _.get(req, "loginUser.id", null),
        createdAt: new Date(),
      },
      listCustomer: _.get(req, "body.listCustomer", []),
      groupProduct: _.get(req, "body.groupProduct", []),
    };
    const result = await createPromotionProgram(data);
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
    const result = await getPromotionProgramDetail(id);
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
    const data = {
      program: {
        title: _.get(req, "body.title", ""),
        slug: _.get(req, "body.slug", ""),
        alt: _.get(req, "body.alt", ""),
        imageId: _.get(req, "body.imageId", null),
        link: _.get(req, "body.link", ""),
        description: _.get(req, "body.description", ""),
        sponsor: _.get(req, "body.sponsor", ""),
        startTime: _.get(req, "body.startTime", null),
        endTime: _.get(req, "body.endTime", null),
        createdBy: _.get(req, "loginUser.id", null),
        updatedBy: _.get(req, "loginUser.id", null),
        updatedAt: new Date(),
      },
      listCustomer: _.get(req, "body.listCustomer", []),
      groupProduct: _.get(req, "body.groupProduct", []),
    };
    const result = await updatePromotionProgram(id, data);
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
    const result = await deletePromotionProgramById(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
