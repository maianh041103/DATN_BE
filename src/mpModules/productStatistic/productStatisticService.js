const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function productStatisticFilter(params) {
  try {
    const { orderBy, page = 1, limit = 10 } = params;

    const query = {
      offset: +limit * (+page - 1),
      limit: +limit,
      raw: true,
    };

    if (_.isArray(orderBy) && orderBy.length) {
      query.order = orderBy;
    }

    const { rows, count } = await models.ProductStatistic.findAndCountAll(
      query
    );

    return {
      statistics: rows,
      total: count,
    };
  } catch (e) {
    return {};
  }
}

export async function updateProductStatistic(params) {
  try {
    const { productId, viewed, sold } = params;

    if (!productId) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
      };
    }

    const instance = await models.ProductStatistic.findOne({
      where: {
        productId,
      },
    });

    if (instance) {
      await instance.increment({
        viewed: viewed ? 1 : 0,
        sold: sold ? +sold : 0,
      });
    } else {
      await models.ProductStatistic.create({
        productId,
        viewed: viewed ? 1 : 0,
        sold: sold ? +sold : 0,
      });
    }

    return {
      success: true,
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
