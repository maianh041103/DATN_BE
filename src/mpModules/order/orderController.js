import { createPaymentAndTransaction, indexPayment } from "./OrderPaymentService";
import { respondWithClientError } from "../../helpers/response";

const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readOrder,
  indexOrders,
  updateOrder,
  createOrder,
  deleteOrder,
  updateOrderStatus,
  indexProductCustomers,
  getOrderDiscountService
} = require("./orderService");
const { orderLogList } = require("./orderHistoryService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexOrders(
      {
        ...req.query,
        storeId: loginUser.storeId,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
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
    const result = await createOrder(
      {
        ...req.body,
        storeId: loginUser.storeId,
        createdBy: loginUser.id,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createPaymentController(req, res) {
  try {
    const { loginUser = {} } = req;
    const { id } = req.params
    const result = await createPaymentAndTransaction(
      {
        ...req.body,
        orderId: id,
        storeId: loginUser.storeId,
        createdBy: loginUser.id,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithClientError(error))
  }
}

export async function readController(req, res) {
  try {
    const { id } = req.params;
    const {saleReturn} = req.query;
    const result = await readOrder({id,saleReturn});
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithClientError(error))
  }
}

export async function readPaymentController(req, res) {
  try {
    const { id: orderId } = req.params
    const result = await indexPayment({ ...req.query, orderId });
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithClientError(error))
  }
}


export async function updateController(req, res) {
  try {
    const { id } = req.params;
    const order = {
      ...req.body,
      updatedBy: _.get(req, "loginUser.id", null),
      roleId: _.get(req, "loginUser.roleId", 0),
      permissions: _.get(req, "permissions", []),
      userToken: _.get(req, "loginUser.token", ""),
    };
    const result = await updateOrder(id, order);
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
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
    const { loginUser = {} } = req;
    const order = {
      status: _.get(req, "body.status", null),
      updatedBy: loginUser.id,
    };
    const result = await updateOrderStatus(id, order);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getProductCustomer(req, res) {
  try {
    const { id } = req.params;
    const result = await indexProductCustomers(id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getOrderHistory(req, res) {
  try {
    const result = await orderLogList(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
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
    const result = await deleteOrder(id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function getOrderDiscount(req, res) {
  try {
    const { id } = req.params;
    const result = await getOrderDiscountService({ id });
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithClientError(error))
  }
}

