const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "description", "storeId"];

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

export async function groupProductFilter(params) {
  try {
    return await models.GroupProduct.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexGroupProducts(params) {
  const { rows, count } = await models.GroupProduct.findAndCountAll(
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

export async function createGroupProduct(groupProduct) {
  const isUniqueValue = await checkUniqueValue("GroupProduct", {
    name: groupProduct.name,
    storeId: groupProduct.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên nhóm sản phẩm ${groupProduct.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newGroupProduct = await models.GroupProduct.create(groupProduct);
  createUserTracking({
    accountId: newGroupProduct.createdBy,
    type: accountTypes.USER,
    objectId: newGroupProduct.id,
    action: logActions.group_product_create.value,
    data: groupProduct,
  });
  return {
    success: true,
    data: newGroupProduct,
  };
}

export async function updateGroupProduct(id, groupProduct) {
  const findGroupProduct = await models.GroupProduct.findByPk(id, {
    attributes: ["id"],
  });

  if (!findGroupProduct) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm sản phẩm không tồn tại",
    };
  }

  const result = await checkUniqueValue("GroupProduct", {
    name: groupProduct.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Nhóm sản phẩm ${groupProduct.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.GroupProduct.update(groupProduct, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: groupProduct.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.group_product_update.value,
    data: { id, ...groupProduct },
  });

  return {
    success: true,
  };
}

export async function readGroupProduct(id, loginUser) {
  const findGroupProduct = await models.GroupProduct.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findGroupProduct) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nhóm sản phẩm không tồn tại`,
    };
  }
  return {
    success: true,
    data: findGroupProduct,
  };
}

export async function deleteGroupProduct(id, loginUser) {
  const findGroupProduct = await models.GroupProduct.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findGroupProduct) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm sản phẩm không tồn tại",
    };
  }

  await models.GroupProduct.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.group_product_delete.value,
    data: { id, name: findGroupProduct.name, storeId: findGroupProduct.storeId },
  });

  return {
    success: true,
  };
}
