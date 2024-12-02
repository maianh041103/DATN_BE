const _ = require("lodash");
const moment = require("moment");
const { createUserTracking } = require("../behavior/behaviorService");
const { accountTypes, logActions } = require("../../helpers/choices");
const models = require("../../../database/models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const { READED } = require("../../helpers/choices");
const {
  ERROR_CODE_SYSTEM_ERROR,
  ERROR_CODE_ITEM_NOT_EXIST,
} = require("../../helpers/errorCodes");
const { typeNotification } = require("./notifyConstant");

function processQuery(params) {
  const {
    keyword,
    type,
    isRead,
    page = 1,
    limit = 10,
    startDate,
    endDate,
    loginUser = {},
    loginCustomer = {},
    listCustomer = [],
    listUser = [],
    include = [
      {
        model: models.Icon,
        as: "icon",
        attributes: ["id", "title"],
        include: [
          {
            model: models.Image,
            as: "image",
            attributes: ["id", "originalName", "fileName", "filePath", "path"],
          },
        ],
      },
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "username", "phone"],
      },
      {
        model: models.User,
        as: "user",
        attributes: ["id", "username", "phone"],
      },
    ],
  } = params;

  const conditions = { deletedAt: null };

  if (!_.isEmpty(loginUser)) {
    conditions.userId = loginUser.id;
  }

  if (!_.isEmpty(loginCustomer)) {
    conditions.customerId = loginCustomer.id;
  }

  if (keyword) {
    conditions[Op.or] = {
      title: {
        [Op.like]: `%${keyword}%`,
      },
    };
  }

  if (typeof type !== "undefined") conditions.type = type;

  if (typeof isRead !== "undefined") conditions.isRead = isRead;

  if (startDate && moment(startDate).isValid()) {
    conditions.createdAt = {
      [Op.gte]: moment(startDate).format("YYYY-MM-DD 00:00:00"),
    };
  }

  if (endDate && moment(endDate).isValid()) {
    conditions.createdAt = {
      [Op.lte]: moment(endDate).format("YYYY-MM-DD 23:59:59"),
    };
  }

  if (_.isArray(listCustomer) && listCustomer.length) {
    conditions.customerId = listCustomer;
  }

  if (_.isArray(listUser) && listUser.length) {
    conditions.userId = listUser;
  }

  const query = {
    attributes: [
      "id",
      "title",
      "content",
      "description",
      "type",
      "url",
      "isRead",
      "objectId",
      "iconId",
      "userId",
      "customerId",
      "createdAt",
    ],
    include,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
    where: conditions,
  };

  return query;
}

export async function changeStatus(id, userId) {
  try {
    const instance = await models.Notification.findOne({
      attributes: ["userId", "isRead"],
      where: {
        id: id,
        userId: userId,
        isRead: READED,
      },
      raw: true,
    });

    if (instance) {
      await models.Notification.update(
        {
          isRead: READED,
          updateAt: new Date(),
        },
        {
          where: {
            id: id,
          },
        }
      );
    }

    return {
      success: true,
    };
  } catch (e) {
    return {
      error: true,
    };
  }
}

export async function notificationFilter(params) {
  try {
    return await models.Notification.findAll(processQuery(params));
  } catch (e) {
    return [];
  }
}

// notification for customer
export async function fetchAllNotificationList(params) {
  try {
    const query = processQuery(params);

    const { typeNoti = "" } = params;

    if (typeNoti == typeNotification.USER_NOTIFICATION) {
      query.where.customerId = { [Op.eq]: null };
    } else if (typeNoti == typeNotification.CUSTOMER_NOTIFICATION) {
      query.where.userId = { [Op.eq]: null };
    }

    const { rows, count } = await models.Notification.findAndCountAll(query);

    return {
      success: true,
      data: {
        items: rows,
        totalItem: count,
      },
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: ERROR_CODE_SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function indexNotifications(params) {
  try {
    return {
      success: true,
      data: {
        items: await notificationFilter(params),
      },
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: ERROR_CODE_SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

// create a new notification
export async function createNotification(params) {
  try {
    const newNotification = await models.Notification.create(params);

    createUserTracking({
      accountId: newNotification.createdBy,
      type: accountTypes.USER,
      objectId: newNotification.id,
      action: logActions.notification_create.value,
      data: { ...params },
    });

    return {
      success: true,
      data: newNotification,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: ERROR_CODE_SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function createNotificationVersion1(params) {
  try {
    const { notification, listCustomer = [], listUser = [] } = params;

    if (_.isArray(listCustomer) && listCustomer.length) {
      for (let customerId of listCustomer) {
        await createNotification({ ...notification, customerId: customerId });
      }
    }

    if (_.isArray(listUser) && listUser.length) {
      for (let userId of listUser) {
        await createNotification({ ...notification, userId: userId });
      }
    }

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: ERROR_CODE_SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function updateNotification(id, params) {
  try {
    const findNotification = await models.Notification.findByPk(id, {
      attributes: ["id"],
    });

    if (!findNotification) {
      return {
        error: true,
        code: ERROR_CODE_ITEM_NOT_EXIST,
        message: "Thông báo không tồn tại",
      };
    }

    await models.Notification.update(params, {
      where: {
        id,
      },
    });

    createUserTracking({
      accountId: params.updatedBy,
      type: accountTypes.USER,
      objectId: id,
      action: logActions.notification_update.value,
      data: { id, ...params },
    });

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: ERROR_CODE_SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function deleteNotificationById(id, loginUser) {
  try {
    const instance = await models.Notification.findByPk(id, {
      attributes: ["id", "title"],
    });

    if (!instance) {
      return {
        error: true,
        code: ERROR_CODE_ITEM_NOT_EXIST,
        message: "Thông báo không tồn tại",
      };
    }

    await models.Notification.destroy({
      where: {
        id,
      },
    });

    createUserTracking({
      accountId: loginUser.id,
      type: accountTypes.USER,
      objectId: instance.id,
      action: logActions.notification_delete.value,
      data: { id, title: instance.title },
    });

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: ERROR_CODE_SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}
