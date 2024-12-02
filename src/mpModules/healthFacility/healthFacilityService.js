const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "storeId"];

export async function isExistHealthFacility(id) {
  return !!(await models.HealthFacility.findOne({ where: { id } }));
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

export async function healthFacilityFilter(params) {
  try {
    return await models.HealthFacility.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexHealthFacilitys(params) {
  const { rows, count } = await models.HealthFacility.findAndCountAll(
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

export async function createHealthFacility(healthFacility) {
  const isUniqueValue = await checkUniqueValue("HealthFacility", {
    name: healthFacility.name,
    storeId: healthFacility.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên cơ sở khám bệnh ${healthFacility.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newHealthFacility = await models.HealthFacility.create(healthFacility);
  createUserTracking({
    accountId: newHealthFacility.createdBy,
    type: accountTypes.USER,
    objectId: newHealthFacility.id,
    action: logActions.health_facility_create.value,
    data: healthFacility,
  });
  return {
    success: true,
    data: newHealthFacility,
  };
}

export async function updateHealthFacility(id, healthFacility, loginUser) {
  const findHealthFacility = await models.HealthFacility.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });

  if (!findHealthFacility) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Cơ sở khám bệnh không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("HealthFacility", {
    name: healthFacility.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Cơ sở khám bệnh ${healthFacility.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.HealthFacility.update(healthFacility, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: healthFacility.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.health_facility_update.value,
    data: { id, ...healthFacility },
  });

  return {
    success: true,
  };
}

export async function readHealthFacility(id, loginUser) {
  const findHealthFacility = await models.HealthFacility.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findHealthFacility) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Cơ sở khám bệnh không tồn tại`,
    };
  }
  return {
    success: true,
    data: findHealthFacility,
  };
}

export async function deleteHealthFacility(id, loginUser) {
  const findHealthFacility = await models.HealthFacility.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findHealthFacility) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Cơ sở khám bệnh không tồn tại",
    };
  }

  await models.HealthFacility.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.health_facility_delete.value,
    data: { id, name: findHealthFacility.name, storeId: findHealthFacility.storeId },
  });

  return {
    success: true,
  };
}
