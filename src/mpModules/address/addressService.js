const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexProvinces(filter) {
  try {
    const { page = 1, limit = 100, keyword = "" } = filter;
    const query = {
      offset: +limit * (+page - 1),
      limit: +limit,
      order: [["id", "ASC"]],
      attributes: ["id", "name"],
    };
    const where = {};
    if (keyword) {
      where[Op.or] = {
        name: {
          [Op.like]: `%${keyword}%`,
        },
        keyword: {
          [Op.like]: `%${keyword}%`,
        },
      };
    }
    query.where = where;
    const { rows, count } = await models.Province.findAndCountAll(query);
    return {
      success: true,
      data: {
        items: rows,
        totalItem: count,
      },
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function indexDistricts(provinceId, filter) {
  try {
    const { page = 1, limit = 100, keyword = "" } = filter;
    const districtIncludes = [
      {
        model: models.Province,
        as: "provinces",
        attributes: ["name"],
      },
    ];
    const query = {
      offset: +limit * (+page - 1),
      limit: +limit,
      order: [["id", "ASC"]],
      attributes: ["id", "provinceId", "name"],
      include: districtIncludes,
    };
    query.where = {
      [Op.or]: {
        name: {
          [Op.like]: `%${keyword}%`,
        },
        keyword: {
          [Op.like]: `%${keyword}%`,
        },
      },
      provinceId: provinceId,
    };
    const { rows, count } = await models.District.findAndCountAll(query);
    return {
      success: true,
      data: {
        items: rows,
        totalItem: count,
      },
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function indexWards(provinceId, districtId, filter) {
  try {
    const { page = 1, limit = 100, keyword = "" } = filter;
    const query = {
      offset: +limit * (+page - 1),
      limit: +limit,
      order: [["id", "ASC"]],
      attributes: [
        "id",
        "provinceId",
        "province",
        "districtId",
        "district",
        "name",
        "address",
      ],
    };
    query.where = {
      [Op.or]: {
        name: {
          [Op.like]: `%${keyword}%`,
        },
      },
      provinceId: provinceId,
      districtId: districtId,
    };
    const { rows, count } = await models.Ward.findAndCountAll(query);
    return {
      success: true,
      data: {
        items: rows,
        totalItem: count,
      },
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}
