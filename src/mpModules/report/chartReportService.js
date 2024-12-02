const moment = require("moment");
const { addFilterByDate } = require("../../helpers/utils");
const _ = require("lodash");
const models = require("../../../database/models");
const { orderStatuses } = require("../order/orderConstant");

export async function indexChartProductsReport(params, loginUser) {
  const {
    status = orderStatuses.SUCCEED,
    branchId,
    productType = "",
    limit = 10,
    type = "quantity", // "revenue"
  } = params;

  const conditions = {
    storeId: loginUser.storeId,
  };
  if (branchId) conditions.branchId = branchId;
  if (status) conditions.status = status;
  if (productType) conditions.productType = productType;

  let { dateRange = {} } = params;
  let {
    startDate = moment().startOf("month"),
    endDate = moment().endOf("month"),
  } = dateRange;
  startDate = moment(startDate).format("YYYY-MM-DD")
  endDate = moment(endDate).format("YYYY-MM-DD")

  if (
    startDate &&
    moment(startDate).isValid() &&
    endDate &&
    moment(endDate).isValid()
  ) {
    conditions.createdAt = addFilterByDate([startDate, endDate]);
  }

  const orderIds = (
    await models.Order.findAll({
      attributes: ["id"],
      where: conditions,
      raw: true,
    })
  ).map((o) => o.id);

  if (!orderIds.length) {
    return {
      success: true,
      data: {
        items: [],
      },
    };
  }

  const queryOrderProduct = {
    attributes: ["quantity", "price", "productId"],
    include: [
      {
        model: models.Product,
        as: "product",
        attributes: [
          "name",
          "shortName",
          "code",
          "barCode",
          "imageId",
          "isBatchExpireControl",
        ],
        include: [
          {
            model: models.Image,
            as: "image",
            attributes: ["id", "originalName", "fileName", "filePath", "path"],
          },
        ],
      },
    ],
    where: {
      orderId: orderIds,
    },
  };

  const orderProducts = await models.OrderProduct.findAll(queryOrderProduct);

  const hashMapProduct = {};
  for (let item of orderProducts) {
    if (hashMapProduct[item.productId]) {
      hashMapProduct[item.productId].quantity += +item.quantity;
      hashMapProduct[item.productId].revenue +=
        +item.quantity * +item.price;
      continue;
    }
    hashMapProduct[item.productId] = {
      name: _.get(item, "product.name", ""),
      shortName: _.get(item, "product.shortName", ""),
      code: _.get(item, "product.code", ""),
      barCode: _.get(item, "product.barCode", ""),
      isBatchExpireControl: _.get(item, "product.isBatchExpireControl", ""),
      image: _.get(item, "product.image", {}),
      quantity: +item.quantity,
      revenue: +item.quantity * +item.price,
    };
  }

  const items = Object.values(hashMapProduct);

  return {
    success: true,
    data: {
      items:
        type === "quantity"
          ? items
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit)
            .sort((a, b) => a.name - b.name)
          : items
            .sort((a, b) => b.revenue - a.revenue)
            .sort((a, b) => a.name - b.name)
            .slice(0, limit),
    },
  };
}
