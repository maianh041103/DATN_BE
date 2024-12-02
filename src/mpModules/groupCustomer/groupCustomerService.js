const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "description", "type", "discount"];

function processBuildQuery(params) {
  const { page = 1, limit = 10, keyword = "", type = "", storeId } = params;
  const query = {
    attributes,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
    raw: true,
  };
  const where = {};
  if (keyword) {
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      description: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  if (storeId) where.storeId = storeId;
  if (type) where.type = type;
  query.where = where;
  return query;
}

export async function groupCustomerFilter(params) {
  try {
    return await models.GroupCustomer.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexGroupCustomers(params) {
  const { rows, count } = await models.GroupCustomer.findAndCountAll(
    processBuildQuery(params)
  );
  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,
    },
  };
}

export async function createGroupCustomer(groupCustomer) {
  const isUniqueValue = await checkUniqueValue("GroupCustomer", {
    name: groupCustomer.name,
    storeId: groupCustomer.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên nhóm khách hàng ${groupCustomer.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newGroupCustomer = await models.GroupCustomer.create(groupCustomer);
  createUserTracking({
    accountId: newGroupCustomer.createdBy,
    type: accountTypes.USER,
    objectId: newGroupCustomer.id,
    action: logActions.group_customer_create.value,
    data: groupCustomer,
  });
  return {
    success: true,
    data: newGroupCustomer,
  };
}

export async function updateGroupCustomer(id, groupCustomer, loginUser) {
  const findGroupCustomer = await models.GroupCustomer.findOne({
    attributes: ["id", "name", "storeId"],
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findGroupCustomer) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm khách hàng không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("GroupCustomer", {
    storeId: loginUser.storeId,
    name: groupCustomer.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Nhóm khách hàng ${groupCustomer.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.GroupCustomer.update(groupCustomer, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: groupCustomer.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.group_customer_update.value,
    data: { id, ...groupCustomer },
  });

  return {
    success: true,
  };
}

export async function readGroupCustomer(id, loginUser) {
  const findGroupCustomer = await models.GroupCustomer.findOne({
    attributes,
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!findGroupCustomer) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nhóm khách hàng không tồn tại`,
    };
  }
  return {
    success: true,
    data: findGroupCustomer,
  };
}

export async function deleteGroupCustomerById(id, loginUser) {
  const groupCustomer = await models.GroupCustomer.findOne({
    attributes: ["id", "name", "storeId"],
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!groupCustomer) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm khách hàng không tồn tại",
    };
  }

  await models.GroupCustomer.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.group_customer_delete.value,
    data: { id, name: groupCustomer.name, storeId: groupCustomer.storeId },
  });

  return {
    success: true,
  };
}
