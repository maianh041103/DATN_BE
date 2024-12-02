const moment = require("moment");
const { addFilterByDate } = require("../../helpers/utils");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { logActions, accountTypes } = require("../../helpers/choices");

function processQuery(filter) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    action = "",
    accountId,
    type,
    attributes,
    customers,
    users,
    order,
  } = filter;

  const query = {
    offset: +limit * (+page - 1),
    limit: +limit,
    raw: true,
  };

  if (_.isArray(attributes) && attributes.length) {
    query.attributes = attributes;
  }
  if (_.isArray(order) && order.length) {
    query.order = order;
  }

  const where = {};
  if (keyword) {
    where[Op.or] = {
      data: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }

  if (action) {
    where.action = action;
  }

  if (accountId) {
    where.accountId = accountId;
  } else if (_.isArray(customers) && customers.length) {
    where.accountId = customers;
  } else if (_.isArray(users) && users.length) {
    where.accountId = users;
  }

  if (type) {
    where.type = type;
  }

  let { dateRange = {} } = filter;
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
    where.createdAt = addFilterByDate([startDate, endDate]);
  }

  query.where = where;

  return query;
}

export async function indexUsersTrack(filter) {
  try {
    const { rows, count } = await models.BehaviorLog.findAndCountAll(
      processQuery(filter)
    );
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
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function countRecordBehavior(filter) {
  try {
    return await models.BehaviorLog.count(processQuery(filter));
  } catch (e) {
    return 0;
  }
}

export async function createUserTracking(payload, transaction) {
  try {
    models.BehaviorLog.create(
      {
        ...payload,
        data: JSON.stringify(payload.data),
        createdAt: payload.createdAt || new Date(),
      },
      {
        ...(transaction && { transaction }),
      }
    );

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function updateUserTracking(id, params) {
  try {
    await models.BehaviorLog.update(params, {
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function readUserTracking(id) {
  try {
    return {
      success: true,
      data: await models.BehaviorLog.findByPk(id, {
        where: {
          id: id,
        },
      }),
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function deleteUserTracking(id) {
  try {
    // check item exist?
    const instance = await models.BehaviorLog.findByPk(id, {
      attributes: ["id"],
    });

    if (!instance) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: "Bản ghi không tồn tại",
      };
    }

    await models.BehaviorLog.destroy({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function indexUsersTracking(filter) {
  try {
    const query = processQuery({
      order: [["id", "DESC"]],
      ...filter,
    });

    const { type } = filter;

    switch (+type) {
      case accountTypes.CUSTOMER:
        query.include = [
          {
            attributes: ["id", "username", "phone"],
            model: models.Customer,
            as: "customer",
          },
        ];
        break;
      case accountTypes.USER:
        query.include = [
          {
            attributes: ["id", "username", "phone"],
            model: models.User,
            as: "user",
          },
        ];
        break;
      default:
        return {
          success: true,
          data: {
            items: [],
            totalItem: 0,
          },
        };
    }

    const { rows, count } = await models.BehaviorLog.findAndCountAll(query);

    for (let item of rows) {
      item.action = logActions[item.action].text || "";
    }

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
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}
