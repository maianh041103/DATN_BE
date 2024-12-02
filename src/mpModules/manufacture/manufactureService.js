const { createUserTracking } = require("../behavior/behaviorService");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");

const attributes = ["id", "name", "storeId", "createdAt"];

function processQuery(params) {
  const { page = 1, limit = 10, keyword = "", storeId } = params;
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

export async function manufactureFilter(params) {
  try {
    return await models.Manufacture.findAll(processQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexManufactures(params) {
  const { rows, count } = await models.Manufacture.findAndCountAll(
    processQuery(params)
  );
  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,
    },
  };
}

export async function createManufacture(params) {
  const name = await checkUniqueValue("Manufacture", { name: params.name, storeId: params.storeId });
  if (!name) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nhà sản xuất có tên ${params.name} đã tồn tại, xin hãy chọn giá trị khác.`,
    };
  }
  const newManufacture = await models.Manufacture.create(params);
  createUserTracking({
    accountId: newManufacture.createdBy,
    type: accountTypes.USER,
    objectId: newManufacture.id,
    action: logActions.manufacture_create.value,
    data: params,
  });
  return {
    success: true,
    data: newManufacture,
  };
}

// update one manufacture
export async function updateManufacture(id, params) {
  if (!id) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Nhà sản xuất không tồn tại",
    };
  }

  // check name is unique?
  let name = await checkUniqueValue("Manufacture", {
    name: params.name,
    id: { [Op.ne]: id },
  });

  if (!name) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nhà sản xuất có tên ${params.name} đã tồn tại, xin hãy chọn giá trị khác.`,
    };
  }

  await models.Manufacture.update(params, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: params.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.manufacture_update.value,
    data: { id, ...params },
  });

  return {
    success: true,
  };
}

// get manufacture detail
export async function readManufacture(id) {
  return {
    success: true,
    data: await models.Manufacture.findByPk(id, {
      attributes,
    }),
  };
}

export async function readManufactureByName(name, storeId) {
  const findManufacture = await models.Manufacture.findOne({
    attributes: ["id"],
    where: {
      name,
      storeId
    }
  });
  return findManufacture;
}

// delete one manufacture
export async function deleteManufactureById(id, loginUser) {
  const manufacture = await models.Manufacture.findByPk(id, {
    attributes: ["id"],
  });

  if (!manufacture) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhà sản xuất không tồn tại",
    };
  }

  await models.Manufacture.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: manufacture.id,
    action: logActions.manufacture_delete.value,
    data: { id, name: manufacture.name },
  });

  return {
    success: true,
  };
}
