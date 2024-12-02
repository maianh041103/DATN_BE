const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "storeId"];

export async function isExistWorkPlace(id) {
  return !!(await models.WorkPlace.findOne({ where: { id } }));
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

export async function workPlaceFilter(params) {
  try {
    return await models.WorkPlace.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexWorkPlaces(params) {
  const { rows, count } = await models.WorkPlace.findAndCountAll(
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

export async function createWorkPlace(workPlace) {
  const isUniqueValue = await checkUniqueValue("WorkPlace", {
    name: workPlace.name,
    storeId: workPlace.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên trình độ ${workPlace.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newWorkPlace = await models.WorkPlace.create(workPlace);
  createUserTracking({
    accountId: newWorkPlace.createdBy,
    type: accountTypes.USER,
    objectId: newWorkPlace.id,
    action: logActions.work_place_create.value,
    data: workPlace,
  });
  return {
    success: true,
    data: newWorkPlace,
  };
}

export async function updateWorkPlace(id, workPlace, loginUser) {
  const findWorkPlace = await models.WorkPlace.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });

  if (!findWorkPlace) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nơi công tác không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("WorkPlace", {
    name: workPlace.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Nơi công tác ${workPlace.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.WorkPlace.update(workPlace, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: workPlace.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.work_place_update.value,
    data: { id, ...workPlace },
  });

  return {
    success: true,
  };
}

export async function readWorkPlace(id, loginUser) {
  const findWorkPlace = await models.WorkPlace.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findWorkPlace) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nơi công tác không tồn tại`,
    };
  }
  return {
    success: true,
    data: findWorkPlace,
  };
}

export async function deleteWorkPlace(id, loginUser) {
  const findWorkPlace = await models.WorkPlace.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findWorkPlace) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nơi công tác không tồn tại",
    };
  }

  await models.WorkPlace.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.work_place_delete.value,
    data: { id, name: findWorkPlace.name, storeId: findWorkPlace.storeId },
  });

  return {
    success: true,
  };
}
