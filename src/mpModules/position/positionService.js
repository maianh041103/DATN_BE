const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "storeId"];
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
    };
  }
  if (storeId) where.storeId = storeId;
  query.where = where;
  return query;
}
export async function indexPosition(params) {
  const { rows, count } = await models.Position.findAndCountAll(
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

export async function createPosition(position) {
  const isUniqueValue = await checkUniqueValue("Position", {
    name: position.name,
    storeId: position.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên trình độ ${position.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newPosition = await models.Position.create(position);
  createUserTracking({
    accountId: newPosition.createdBy,
    type: accountTypes.USER,
    objectId: newPosition.id,
    action: logActions.position_create.value,
    data: position,
  });
  return {
    success: true,
    data: newPosition,
  };
}

export async function updatePosition(id, position, loginUser) {
  const findPosition = await models.Position.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });

  if (!findPosition) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Vị trí không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("Position", {
    name: position.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Vị trí ${position.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.Position.update(position, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: position.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.position_update.value,
    data: { id, ...position },
  });

  return {
    success: true,
  };
}

export async function readPosition(id, loginUser) {
  const findPosition = await models.Position.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findPosition) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Vị trí không tồn tại`,
    };
  }
  return {
    success: true,
    data: findPosition,
  };
}

export async function deletePosition(id, loginUser) {
  const findPosition = await models.Position.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findPosition) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Vị trí không tồn tại",
    };
  }

  await models.Position.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.position_delete.value,
    data: { id, name: findPosition.name, storeId: findPosition.storeId },
  });

  return {
    success: true,
  };
}
