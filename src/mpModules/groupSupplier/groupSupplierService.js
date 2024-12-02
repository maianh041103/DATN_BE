const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "description", "storeId"];

export async function isExistGroupSupplier(id) {
  return !!(await models.GroupSupplier.findOne({ where: { id } }));
}

function processBuildQuery(params) {
  const { page = 1, limit = 10, keyword = "", storeId = "" } = params;
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
  query.where = where;
  return query;
}

export async function groupSupplierFilter(params) {
  try {
    return await models.GroupSupplier.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexGroupSuppliers(params) {
  const { rows, count } = await models.GroupSupplier.findAndCountAll(
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

export async function createGroupSupplier(groupSupplier) {
  const isUniqueValue = await checkUniqueValue("GroupSupplier", {
    name: groupSupplier.name,
    storeId: groupSupplier.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên nhóm nhà cung cấp ${groupSupplier.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newGroupSupplier = await models.GroupSupplier.create(groupSupplier);
  createUserTracking({
    accountId: newGroupSupplier.createdBy,
    type: accountTypes.USER,
    objectId: newGroupSupplier.id,
    action: logActions.group_supplier_create.value,
    data: groupSupplier,
  });
  return {
    success: true,
    data: newGroupSupplier,
  };
}

export async function updateGroupSupplier(id, groupSupplier, loginUser) {
  const findGroupSupplier = await models.GroupSupplier.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });

  if (!findGroupSupplier) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm nhà cung cấp không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("GroupSupplier", {
    name: groupSupplier.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Nhóm nhà cung cấp ${groupSupplier.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.GroupSupplier.update(groupSupplier, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: groupSupplier.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.group_supplier_update.value,
    data: { id, ...groupSupplier },
  });

  return {
    success: true,
  };
}

export async function readGroupSupplier(id, loginUser) {
  const findGroupSupplier = await models.GroupSupplier.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findGroupSupplier) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nhóm nhà cung cấp không tồn tại`,
    };
  }
  return {
    success: true,
    data: findGroupSupplier,
  };
}

export async function deleteGroupSupplier(id, loginUser) {
  const findGroupSupplier = await models.GroupSupplier.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findGroupSupplier) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm nhà cung cấp không tồn tại",
    };
  }
  await models.GroupSupplier.destroy({
    where: {
      id,
    },
  });
  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.group_supplier_delete.value,
    data: { id, name: findGroupSupplier.name, storeId: findGroupSupplier.storeId },
  });
  return {
    success: true,
  };
}
