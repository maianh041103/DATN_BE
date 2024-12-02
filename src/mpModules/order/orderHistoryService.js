const moment = require("moment");
const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { orderHistoryStatus, orderStatuses } = require("./orderConstant");
const { ERROR_CODE_SYSTEM_ERROR } = require("../../helpers/errorCodes");
const { addFilterByDate } = require("../../helpers/utils");

const orderHistoryIncludes = [
  {
    model: models.User,
    as: "user",
    attributes: ["id", "username"],
  },
  {
    model: models.Order,
    as: "order",
    attributes: ["id", "code", "totalPrice", "customerId"],
    include: [
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "username"],
      },
    ],
  },
];

function hashMapMessageUpdateStatusOrder(status) {
  switch (status) {
    case orderStatuses.PENDING:
      return "ĐANG CHỜ";
    case orderStatuses.SHIPPING:
      return "ĐANG GIAO HÀNG";
    case orderStatuses.DELIVERING:
      return "ĐÃ GIAO HÀNG";
    case orderStatuses.PAID:
      return "ĐÃ THANH TOÁN";
    case orderStatuses.CANCELLED:
      return "ĐÃ HỦY";
    case orderStatuses.SUCCEED:
      return "ĐƠN HÀNG THANH CÔNG";
    default:
      return "";
  }
}

export async function createOrderLog(params) {
  try {
    const { newOrder, orderId } = params;
    const oldOrder = await models.Order.findOne({
      attributes: ["id", "status"],
      where: {
        id: orderId,
      },
      raw: true,
    });
    if (!oldOrder || !newOrder) {
      return false;
    }
    if (oldOrder.status != newOrder.status) {
      await models.OrderLog.create({
        orderId: orderId,
        action: orderHistoryStatus.UPDATE,
        status: newOrder.status,
        oldStatus: oldOrder.status,
        createdBy: newOrder.updatedBy,
        createdAt: new Date(),
      });
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function orderLogList(params) {
  try {
    const {
      userId,
      users,
      customers,
      code,
      orderId,
      status,
      action,
      page = 1,
      limit = 10,
    } = params;

    const condition = {};

    if (code) {
      const order = await models.Order.findOne({
        where: {
          code: code,
        },
      });
      if (order) {
        condition.orderId = order.id;
      } else {
        return {
          success: true,
          data: {
            list_order_log: [],
            totalItem: 0,
          },
        };
      }
    }
    if (orderId) {
      condition.orderId = orderId;
    }
    if (status) {
      condition.status = status;
    }
    if (action) {
      condition.action = action;
    }
    if (userId) {
      condition.createdBy = userId;
    }
    if (_.isArray(users) && users.length) {
      condition.createdBy = users;
    }
    if (_.isArray(customers) && customers.length) {
      const orders = await models.Order.findAll({
        where: {
          customerId: customers,
        },
      });
      if (_.isArray(orders) && orders.length) {
        condition.orderId = orders.map((o) => o.id);
      } else {
        return {
          success: true,
          data: {
            list_order_log: [],
            totalItem: 0,
          },
        };
      }
    }

    let { dateRange = {} } = params;
    try {
      dateRange = JSON.parse(dateRange);
    } catch (e) {
      dateRange = {};
    }
    const { startDate, endDate } = dateRange;
    if (
      startDate &&
      moment(startDate).isValid() &&
      endDate &&
      moment(endDate).isValid()
    ) {
      condition.createdAt = addFilterByDate([startDate, endDate]);
    }

    const query = {
      include: orderHistoryIncludes,
      offset: +limit * (+page - 1),
      limit: +limit,
      where: condition,
      order: [["id", "DESC"]],
    };

    const { rows, count } = await models.OrderLog.findAndCountAll(query);

    for (let item of rows) {
      item.action = `Cập nhật từ trạng thái ${hashMapMessageUpdateStatusOrder(
        item.oldStatus
      )} thành ${hashMapMessageUpdateStatusOrder(item.status)}`;
    }

    return {
      success: true,
      data: {
        list_order_log: rows,
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
