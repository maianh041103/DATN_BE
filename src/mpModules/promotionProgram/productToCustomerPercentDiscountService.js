const moment = require("moment");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");

export async function productToCustomerPercentDiscountFilter(params) {
  const { productId, customerId, time } = params;
  const conditions = { deletedAt: null };
  if (customerId) conditions.customerId = customerId;
  if (productId) conditions.productId = productId;
  const query = {
    where: conditions,
    order: [["percentDiscount", "DESC"]],
    raw: true,
  };
  if (time) {
    query.where.startTime = {
      [Op.lte]: moment(time).format("YYYY-MM-DD HH:mm:ss"),
    };
    query.where.endTime = {
      [Op.gte]: moment(time).format("YYYY-MM-DD HH:mm:ss"),
    };
  }
  try {
    return await models.ProductToCustomerPercentDiscount.findAll(query);
  } catch (e) {
    console.log(e);
    return [];
  }
}
