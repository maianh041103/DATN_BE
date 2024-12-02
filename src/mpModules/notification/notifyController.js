const _ = require("lodash");
const {
  respondWithError,
  respondItemSuccess,
} = require("../../helpers/response");
const {
  indexNotifications,
  fetchAllNotificationList,
  createNotification,
  updateNotification,
  deleteNotificationById,
} = require("./notifyService");
const { iconSystemNotificationId } = require("./notifyConstant");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function getNotificationList(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexNotifications({ ...req.query, loginUser });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function getAllNotificationList(req, res) {
  try {
    const result = await fetchAllNotificationList(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function insertNotification(req, res) {
  try {
    const data = {
      userId: _.get(req, "body.userId", null),
      customerId: _.get(req, "body.customerId", null),
      parentId: _.get(req, "body.parentId", null),
      role: _.get(req, "body.role", ""),
      title: _.get(req, "body.title", ""),
      description: _.get(req, "body.description", ""),
      content: _.get(req, "body.content", ""),
      type: _.get(req, "body.type", ""),
      iconId: _.get(req, "body.iconId", iconSystemNotificationId),
      url: _.get(req, "body.url", ""),
      objectId: _.get(req, "body.objectId", null),
      createdBy: _.get(req, "loginUser.id", null),
      createdAt: new Date(),
    };

    const listCustomer = _.get(req, "body.listCustomer", []);
    const listUser = _.get(req, "body.listUser", []);
    if (_.isArray(listCustomer) && listCustomer.length) {
      for (let customerId of listCustomer) {
        await createNotification({ ...data, customerId: customerId });
      }
    } else if (_.isArray(listUser) && listUser.length) {
      for (let userId of listUser) {
        await createNotification({ ...data, userId: userId });
      }
    } else {
      await createNotification(data);
    }
    res.json(respondItemSuccess());
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function editNotification(req, res) {
  try {
    const { id } = req.params;
    const data = {
      userId: _.get(req, "body.userId", null),
      customerId: _.get(req, "body.customerId", null),
      parentId: _.get(req, "body.parentId", null),
      role: _.get(req, "body.role", ""),
      title: _.get(req, "body.title", ""),
      description: _.get(req, "body.description", ""),
      content: _.get(req, "body.content", ""),
      type: _.get(req, "body.type", ""),
      iconId: _.get(req, "body.iconId", null),
      url: _.get(req, "body.url", ""),
      objectId: _.get(req, "body.objectId", null),
      updatedBy: _.get(req, "loginUser.id", null),
      updatedAt: new Date(),
    };
    const result = await updateNotification(id, data);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteNotificationById(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
