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

export async function indexDosage(params) {
  const { rows, count } = await models.Dosage.findAndCountAll(
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

export async function createDosage(dosage) {
  const isUniqueValue = await checkUniqueValue("Dosage", {
    name: dosage.name,
    storeId: dosage.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên đường thuốc ${dosage.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newDosage = await models.Dosage.create(dosage);
  createUserTracking({
    accountId: newDosage.createdBy,
    type: accountTypes.USER,
    objectId: newDosage.id,
    action: logActions.dosage_create.value,
    data: dosage,
  });
  return {
    success: true,
    data: newDosage,
  };
}

export async function updateDosage(id, dosage, loginUser) {
  const findDosage = await models.Dosage.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });

  if (!findDosage) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Đường thuốc không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("Dosage", {
    name: dosage.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Đường thuốc ${dosage.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.Dosage.update(dosage, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: dosage.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.dosage_update.value,
    data: { id, ...dosage },
  });

  return {
    success: true,
  };
}

export async function readDosage(id, loginUser) {
  const findDosage = await models.Dosage.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findDosage) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Đường thuốc không tồn tại`,
    };
  }
  return {
    success: true,
    data: findDosage,
  };
}

export async function deleteDosage(id, loginUser) {
  const findDosage = await models.Dosage.findOne({
    where: {
      id,
      storeId: loginUser.storeId
    },
  });
  if (!findDosage) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Đường thuốc không tồn tại",
    };
  }

  await models.Dosage.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.dosage_delete.value,
    data: { id, name: findDosage.name, storeId: findDosage.storeId },
  });

  return {
    success: true,
  };
}
