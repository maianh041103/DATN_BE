const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "storeId"];

export async function isExistSpecialist(id) {
  return !!(await models.Specialist.findOne({ where: { id } }));
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

export async function specialistFilter(params) {
  try {
    return await models.Specialist.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexSpecialists(params) {
  const { rows, count } = await models.Specialist.findAndCountAll(
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

export async function createSpecialist(specialist) {
  const isUniqueValue = await checkUniqueValue("Specialist", {
    name: specialist.name,
    storeId: specialist.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên chuyên khoa ${specialist.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newSpecialist = await models.Specialist.create(specialist);
  createUserTracking({
    accountId: newSpecialist.createdBy,
    type: accountTypes.USER,
    objectId: newSpecialist.id,
    action: logActions.specialist_create.value,
    data: specialist,
  });
  return {
    success: true,
    data: newSpecialist,
  };
}

export async function updateSpecialist(id, specialist) {
  const findSpecialist = await models.Specialist.findByPk(id, {
    attributes: ["id"],
  });

  if (!findSpecialist) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Chuyên khoa không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("Specialist", {
    name: specialist.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Chuyên khoa ${specialist.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.Specialist.update(specialist, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: specialist.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.specialist_update.value,
    data: { id, ...specialist },
  });

  return {
    success: true,
  };
}

export async function readSpecialist(id, loginUser) {
  const findSpecialist = await models.Specialist.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findSpecialist) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Chuyên khoa không tồn tại`,
    };
  }
  return {
    success: true,
    data: findSpecialist,
  };
}

export async function deleteSpecialist(id, loginUser) {
  const findSpecialist = await models.Specialist.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findSpecialist) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Chuyên khoa không tồn tại",
    };
  }

  await models.Specialist.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.specialist_delete.value,
    data: { id, name: findSpecialist.name, storeId: findSpecialist.storeId },
  });

  return {
    success: true,
  };
}
