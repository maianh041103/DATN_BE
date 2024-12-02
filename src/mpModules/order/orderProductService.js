const _ = require("lodash");
const models = require("../../../database/models");
const orderProductAttributes = ["orderId"];

export async function orderProductFilter(params) {
  try {
    const {
      userId,
      orderId,
      productId,
      productIds,
      customerId,
      groupCustomerId,
      groupCustomerIds = [],
    } = params;

    const conditions = { deletedAt: null };

    if (customerId) {
      conditions.customerId = customerId;
    }

    if (userId) {
      conditions.userId = userId;
    }

    if (orderId) {
      conditions.orderId = orderId;
    }

    if (productId) {
      conditions.productId = productId;
    }

    if (groupCustomerId) {
      conditions.groupCustomerId = groupCustomerId;
    }

    if (_.isArray(groupCustomerIds) && groupCustomerIds.length) {
      conditions.groupCustomerId = groupCustomerIds;
    }

    return await models.OrderProduct.findAll({
      attributes: orderProductAttributes,
      where: conditions,
      raw: true,
    });
  } catch (e) {
    return [];
  }
}
