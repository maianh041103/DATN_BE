const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  getDiscountProgramDetail,
  fetchDiscountProgramList,
  updateDiscountProgram,
  createDiscountProgram,
  deleteDiscountProgramById,
} = require("./discountProgramService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function getList(req, res) {
  try {
    const result = await fetchDiscountProgramList(req.query);
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
    const products = _.get(req, "body.products", []);
    const data = {
      startTime: _.get(req, "body.startTime", null),
      endTime: _.get(req, "body.endTime", null),
      listCustomer: _.get(req, "body.listCustomer", []),
      createdBy: _.get(req, "loginUser.id", null),
      createdAt: new Date(),
    };
    for (let item of products) {
      let result = await createDiscountProgram({
        ...data,
        productId: item.productId,
        percentDiscount: item.percentDiscount,
      });
      if (!result.success) {
        res.json(respondWithError(result.code, result.message, {}));
      }
    }
    res.json(respondItemSuccess());
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getDetail(req, res) {
  try {
    const { id } = req.params;
    const result = await getDiscountProgramDetail(id);
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
    const products = _.get(req, "body.products", []);
    const data = {
      startTime: _.get(req, "body.startTime", null),
      endTime: _.get(req, "body.endTime", null),
      listCustomer: _.get(req, "body.listCustomer", []),
      updatedBy: _.get(req, "loginUser.id", null),
      updatedAt: new Date(),
    };
    for (let item of products) {
      let result = await updateDiscountProgram(id, {
        ...data,
        productId: item.productId,
        percentDiscount: item.percentDiscount,
      });
      if (!result.success) {
        res.json(respondWithError(result.code, result.message, {}));
      }
    }
    res.json(respondItemSuccess());
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteDiscountProgram(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteDiscountProgramById(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
