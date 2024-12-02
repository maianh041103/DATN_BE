const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "storeId"];

export async function isExistLevel(id) {
  return !!(await models.Level.findOne({ where: { id } }));
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
    };
  }
  if (storeId) where.storeId = storeId;
  query.where = where;
  return query;
}

export async function levelFilter(params) {
  try {
    return await models.Level.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexLevels(params) {
  const { rows, count } = await models.Level.findAndCountAll(
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

export async function createLevel(level) {
  const isUniqueValue = await checkUniqueValue("Level", {
    name: level.name,
    storeId: level.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên trình độ ${level.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newLevel = await models.Level.create(level);
  createUserTracking({
    accountId: newLevel.createdBy,
    type: accountTypes.USER,
    objectId: newLevel.id,
    action: logActions.level_create.value,
    data: level,
  });
  return {
    success: true,
    data: newLevel,
  };
}

export async function updateLevel(id, level, loginUser) {
  const findLevel = await models.Level.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });

  if (!findLevel) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Chuyên khoa không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("Level", {
    name: level.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Chuyên khoa ${level.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.Level.update(level, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: level.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.level_update.value,
    data: { id, ...level },
  });

  return {
    success: true,
  };
}

export async function readLevel(id, loginUser) {
  const findLevel = await models.Level.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findLevel) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Chuyên khoa không tồn tại`,
    };
  }
  return {
    success: true,
    data: findLevel,
  };
}

export async function deleteLevel(id, loginUser) {
  const findLevel = await models.Level.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findLevel) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Chuyên khoa không tồn tại",
    };
  }

  await models.Level.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.level_delete.value,
    data: { id, name: findLevel.name, storeId: findLevel.storeId },
  });

  return {
    success: true,
  };
}
