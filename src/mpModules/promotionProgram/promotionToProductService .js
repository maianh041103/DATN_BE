const _ = require("lodash");
const models = require("../../../database/models");

export async function promotionProgramToProductFilter(params) {
  const { promotionId, productId } = params;
  const conditions = {};
  if (promotionId) {
    conditions.promotionId = promotionId;
  }
  if (productId) {
    conditions.productId = productId;
  }
  return await models.PromotionToProduct.findAll({
    where: conditions,
  });
}
