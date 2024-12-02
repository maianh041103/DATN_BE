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
    order: [["storeId", "DESC"], ["id", "DESC"]],
    raw: true,
  };
  const where = {};

  where.storeId = {
    [Op.or]: {
      ...(storeId && { [Op.in]: [storeId] }),
      [Op.is]: null, // Include null values
    },
  };

  if (keyword) {
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  query.where = where;
  return query;
}

export async function indexCountryProduce(params) {
  const { rows, count } = await models.CountryProduce.findAndCountAll(
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

export async function createCountryProduce(countryProduce) {
  const isUniqueValue = await checkUniqueValue("CountryProduce", {
    name: countryProduce.name,
    storeId: countryProduce.storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên trình độ ${countryProduce.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }
  const newCountryProduce = await models.CountryProduce.create(countryProduce);
  createUserTracking({
    accountId: newCountryProduce.createdBy,
    type: accountTypes.USER,
    objectId: newCountryProduce.id,
    action: logActions.country_produce_create.value,
    data: countryProduce,
  });
  return {
    success: true,
    data: newCountryProduce,
  };
}

export async function readCountryByName(name, storeId) {
  const findCountry = await models.CountryProduce.findOne({
    attributes: ["id"],
    where: {
      name,
      storeId,
    },
  });
  return findCountry;
}

export async function updateCountryProduce(id, countryProduce, loginUser) {
  const findCountryProduce = await models.CountryProduce.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findCountryProduce) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nước sản xuất không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("CountryProduce", {
    name: countryProduce.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Nước sản xuất ${countryProduce.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.CountryProduce.update(countryProduce, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: countryProduce.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.country_produce_update.value,
    data: { id, ...countryProduce },
  });

  return {
    success: true,
  };
}

export async function readCountryProduce(id, loginUser) {
  const findCountryProduce = await models.CountryProduce.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!findCountryProduce) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nước sản xuất không tồn tại`,
    };
  }
  return {
    success: true,
    data: findCountryProduce,
  };
}

export async function deleteCountryProduce(id, loginUser) {
  const findCountryProduce = await models.CountryProduce.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!findCountryProduce) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nước sản xuất không tồn tại",
    };
  }

  await models.CountryProduce.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.country_produce_delete.value,
    data: {
      id,
      name: findCountryProduce.name,
      storeId: findCountryProduce.storeId,
    },
  });

  return {
    success: true,
  };
}
