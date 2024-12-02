import { PRODUCTS_CONCERN, SALES_CONCERN } from "./contant";
import { groupByField } from "./util";

const moment = require("moment");
const { addFilterByDate } = require("../../helpers/utils");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { userPositions } = require("../user/userConstant");
const {
  paymentTypes,
  orderStatusOptions,
  orderStatuses,
} = require("../order/orderConstant");
const { productIncludes } = require("../product/productService");

export async function indexProductsReport(params) {
  switch (params.concern) {
    case PRODUCTS_CONCERN.SALE:
      return await getReportBySale(params);
    case PRODUCTS_CONCERN.WAREHOUSE_VALUE:
      return await getReportBySale(params);
    case PRODUCTS_CONCERN.INVENTORY:
      return await getReportBySale(params);
    case PRODUCTS_CONCERN.INVENTORY_DETAIL:
      return await getReportBySale(params);
    case PRODUCTS_CONCERN.CANCEL:
      return await getReportBySale(params);
    case PRODUCTS_CONCERN.CUSTOMER:
      return await getReportBySale(params);
    case PRODUCTS_CONCERN.REVENUE:
      return await getReportByRevenue(params);
    case PRODUCTS_CONCERN.EMPLOYEE:
      return await getReportBySale(params);
  }
}

export async function getReportBySale(params) {
  const {
    limit = 20,
    page = 1,
    branchId,
    storeId,
    from,
    to,
    productIds
  } = params;
  let productWhere = {}
  let orderWhere = {}
  if (productIds) {
    productWhere.productId = { [Op.in]: productIds }
  }
  if (storeId) {
    productWhere.storeId = storeId
  }
  if (from && to) {
    orderWhere.createdAt = {
      [Op.and]: {
        [Op.gte]: moment(from).startOf("day"),
        [Op.lte]: moment(to).endOf("day")
      }
    }
  }
  const attributes = [
    [models.sequelize.literal('product.code'), 'title'],
    [models.sequelize.literal('product.code'), 'productCode'],
    [models.sequelize.literal('product.name'), 'productName'],
    [models.sequelize.literal('product.id'), 'productId'],
    [models.sequelize.literal('SUM(OrderProduct.quantity * productUnit.exchangeValue)'), 'totalSell'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalOrderPrice'],
    [models.sequelize.literal('0'), 'returnQuality'],
    [models.sequelize.literal('0'), 'returnValue'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalRevenue'],
  ]
  const summaryAttribute = [
    [models.sequelize.literal('SUM(OrderProduct.quantity * productUnit.exchangeValue)'), 'totalSell'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalOrderPrice'],
    [models.sequelize.literal('0'), 'returnQuality'],
    [models.sequelize.literal('0'), 'returnValue'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalRevenue'],
  ]
  const includes = [
    {
      model: models.ProductUnit,
      attributes: [],
      as: 'productUnit'
    },
    {
      model: models.Product,
      attributes: [],
      as: 'product'
    },
    {
      model: models.Order,
      attributes: [],
      as: 'order',
      where: {
        branchId
      }
    },
  ]
  const [items, count] = await Promise.all([
    models.OrderProduct.findAll({
      attributes: attributes,
      include: includes,
      group: ['product.code'],
      offset: +limit * (+page - 1),
      limit: +limit,
      where: orderWhere,
      order: [[models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'DESC']]
    }),
    await models.OrderProduct.count({
      include: includes,
      where: orderWhere,
      group: ['product.code']
    })
  ])
  const summaryObj = await models.OrderProduct.findAll({
    attributes: summaryAttribute,
    include: includes,
    where: orderWhere,
  })
  const summary = summaryObj[0]
  return {
    success: true,
    data: {
      items: items,
      summary: { totalCount: count.length, ...summary.dataValues }
    }
  };
}

export async function getReportByRevenue(params) {
  const {
    limit = 20,
    page = 1,
    branchId,
    storeId,
    from,
    to
  } = params;
  let productWhere = {}
  let orderWhere = {}
  if (storeId) {
    productWhere.storeId = storeId
  }
  if (from && to) {
    orderWhere.createdAt = {
      [Op.and]: {
        [Op.gte]: moment(from).startOf("day"),
        [Op.lte]: moment(to).endOf("day")
      }
    }
  }

  let startDay = moment(from).startOf("day").format('YYYY-MM-DD HH:mm:ss');
  let endDay = moment(to).startOf("day").format('YYYY-MM-DD HH:mm:ss');

  let condition = `sri.productUnitId = productUnit.id 
      AND sri.deletedAt IS NULL AND sri.createdAt >= '${startDay}' AND sri.createdAt <= '${endDay}'
      AND sri.branchId ='${branchId}'`;
  const attributes = [
    [models.sequelize.literal('product.code'), 'title'],
    [models.sequelize.literal('product.code'), 'productCode'],
    [models.sequelize.literal('product.name'), 'productName'],
    [models.sequelize.literal('product.id'), 'productId'],
    [models.sequelize.literal('SUM(OrderProduct.quantity * productUnit.exchangeValue)'), 'totalSell'], //số lượng bán
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalOrderPrice'], //doanh thu
    [models.sequelize.literal(`(SELECT SUM(sri.quantity * product_units.exchangeValue) FROM sale_return_item AS sri 
      INNER JOIN product_units ON sri.productUnitId = product_units.id WHERE ${condition})`), 'returnQuantity'], //tổng trả hàng
    [models.sequelize.literal(`(SELECT SUM(sri.quantity * sri.price) FROM sale_return_item AS sri WHERE ${condition})`), 'returnValue'],
    [models.sequelize.literal('OrderProduct.primePrice'), 'primePrice']
  ]

  const includes = [
    {
      model: models.ProductUnit,
      attributes: [],
      as: 'productUnit'
    },
    {
      model: models.Product,
      attributes: [],
      as: 'product'
    },
    {
      model: models.Order,
      attributes: [],
      as: 'order',
      where: {
        branchId
      }
    }
  ]
  const [items, count] = await Promise.all([
    models.OrderProduct.findAll({
      attributes: attributes,
      include: includes,
      group: ['product.id'],
      offset: +limit * (+page - 1),
      limit: +limit,
      where: orderWhere
    }),
    await models.OrderProduct.count({
      include: includes,
      where: orderWhere,
      group: ['product.id']
    })
  ])
  let summary = {
    summaryProduct: 0,
    summarySell: 0,
    summaryOrderPrice: 0,
    summaryReturnQuantity: 0,
    summaryReturnValue: 0,
    summaryRevenue: 0,
    summaryPrimePrice: 0,
    summaryProfit: 0,
    summaryRates: 0
  };
  for (const item of items) {
    item.dataValues.totalSell = parseInt(item.dataValues.totalSell);
    item.dataValues.returnQuantity = parseInt(item.dataValues.returnQuantity || 0);
    item.dataValues.returnValue = parseInt(item.dataValues.returnValue || 0);
    item.dataValues.totalPrimePrice = (parseInt(item.dataValues.totalSell - item.dataValues.returnQuantity) * item.dataValues.primePrice) || 0;
    item.dataValues.totalRevenue = item.dataValues.totalOrderPrice - item.dataValues.returnValue; //doanh thu thuần
    item.dataValues.profit = parseInt(item.dataValues.totalRevenue - item.dataValues.totalPrimePrice);
    item.dataValues.rates = (item.dataValues.profit * 100 / item.dataValues.totalRevenue) || 0;
    summary.summarySell += item.dataValues.totalSell;
    summary.summaryOrderPrice += item.dataValues.totalOrderPrice;
    summary.summaryReturnQuantity += item.dataValues.returnQuantity;
    summary.summaryReturnValue += item.dataValues.returnValue;
    summary.summaryRevenue += item.dataValues.totalRevenue;
    summary.summaryPrimePrice += item.dataValues.totalPrimePrice;
    summary.summaryProfit += item.dataValues.profit;
  }
  summary.summaryProduct = items.length;
  summary.summaryRates += (summary.summaryProfit * 100 / summary.summaryRevenue) || 0;

  return {
    success: true,
    data: {
      items: items,
      summary: summary
    }
  };
}

export async function getReportByWarehouseValue(params) {
  const {
    limit = 20,
    page = 1,
    branchId,
    storeId,
    from,
    to,
    productIds
  } = params;
  let productWhere = {}
  let orderWhere = {}
  if (productIds) {
    productWhere.productId = { [Op.in]: productIds }
  }
  if (storeId) {
    productWhere.storeId = storeId
  }
  if (from && to) {
    orderWhere.createdAt = {
      [Op.and]: {
        [Op.gte]: moment(from).startOf("day"),
        [Op.lte]: moment(to).endOf("day")
      }
    }
  }
  const attributes = [
    [models.sequelize.literal('product.code'), 'title'],
    [models.sequelize.literal('product.code'), 'productCode'],
    [models.sequelize.literal('product.name'), 'productName'],
    [models.sequelize.literal('product.id'), 'productId'],
    [models.sequelize.literal('SUM(OrderProduct.quantity * productUnit.exchangeValue)'), 'totalSell'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalOrderPrice'],
    [models.sequelize.literal('0'), 'returnQuality'],
    [models.sequelize.literal('0'), 'returnValue'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalRevenue'],
  ]
  const summaryAttribute = [
    [models.sequelize.literal('SUM(OrderProduct.quantity * productUnit.exchangeValue)'), 'totalSell'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalOrderPrice'],
    [models.sequelize.literal('0'), 'returnQuality'],
    [models.sequelize.literal('0'), 'returnValue'],
    [models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'totalRevenue'],
  ]
  const includes = [
    {
      model: models.ProductUnit,
      attributes: [],
      as: 'productUnit'
    },
    {
      model: models.Product,
      attributes: [],
      as: 'product'
    },
    {
      model: models.Order,
      attributes: [],
      as: 'order',
      where: {
        branchId
      }
    },
  ]
  const [items, count] = await Promise.all([
    models.OrderProduct.findAll({
      attributes: attributes,
      include: includes,
      group: ['product.code'],
      offset: +limit * (+page - 1),
      limit: +limit,
      where: orderWhere,
      order: [[models.sequelize.literal('SUM(OrderProduct.price)-SUM(OrderProduct.discount)'), 'DESC']]
    }),
    await models.OrderProduct.count({
      include: includes,
      where: orderWhere,
      group: ['product.code']
    })
  ])
  const summaryObj = await models.OrderProduct.findAll({
    attributes: summaryAttribute,
    include: includes,
    where: orderWhere,
  })
  const summary = summaryObj[0]
  return {
    success: true,
    data: {
      items: items,
      summary: { totalCount: count.length, ...summary.dataValues }
    }
  };
}