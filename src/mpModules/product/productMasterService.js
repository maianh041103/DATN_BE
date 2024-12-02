import { findAllBatchByListProduct, findAllBatchByProductId } from "../batch/batchService";
import { getInventory } from "../inventory/inventoryService";
import { productStatuses } from "./productConstant";

const { PAGE_LIMIT } = require("../../helpers/choices");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const {
  productIncludes,
  productAttributes,
} = require("./constant");
const { formatDecimalTwoAfterPoint } = require("../../helpers/utils");

const ignoreAliasModels = ["store", "branch"];

export const productMasterIncludes = [
  {
    model: models.Store,
    as: "store",
    attributes: [
      "id",
      "name",
      "phone",
      "provinceId",
      "districtId",
      "wardId",
      "address",
      "createdAt",
    ],
  },
  {
    model: models.Branch,
    as: "branch",
    attributes: [
      "id",
      "name",
      "phone",
      "code",
      "zipCode",
      "provinceId",
      "districtId",
      "wardId",
      "isDefaultBranch",
      "createdAt",
    ],
  },
];

export async function indexMasterSaleProducts(params) {
  const limit = +params.limit || 10;
  const page = +params.page || 1;
  const { storeId, branchId, keyword, productUnit, listProductUnitId } = params;
  const where = {};
  if (storeId) {
    where.storeId = storeId;
  }
  if (productUnit) {
    where.id = productUnit;
  }
  if (keyword) {
    const _products = await models.Product.findAll({
      attributes: ['id'],
      where: {
        [Op.or]: {
          name: {
            [Op.like]: `%${keyword.trim()}%`,
          },
          slug: {
            [Op.like]: `%${keyword.trim()}%`,
          },
        }
      }
    })
    const productIds = _products.map(x => x.id)
    where[Op.or] = {
      code: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      barCode: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      productId: {
        [Op.in]: productIds
      }
    }
  }
  if(listProductUnitId){
    const listUnitId = listProductUnitId.split(",");
    where.id = {
      [Op.in]:listUnitId
    }
  }
  const [items, count] = await Promise.all([
    models.ProductUnit.findAll({
      attributes: [
        "id",
        "unitName",
        "exchangeValue",
        "price",
        "productId",
        "code",
        "barCode",
        "isDirectSale",
        "isBaseUnit",
        "point",
        "storeId",
        "branchId",
      ],
      include: [
        {
          model: models.Product,
          as: "product",
          attributes: productAttributes,
          include: [
            ...productIncludes.filter(
              (productInclude) => !ignoreAliasModels.includes(productInclude.as)
            ),
            {
              model: models.ProductUnit,
              as: "productUnit",
              attributes: [
                "id",
                "unitName",
                "exchangeValue",
                "price",
                "productId",
                "code",
                "barCode",
                "isDirectSale",
                "isBaseUnit",
                "point",
              ],
            },
          ],
          where: {
            status: productStatuses.ACTIVE
          }
        },
        ...productMasterIncludes,
      ],
      where,
      offset: limit * (page - 1),
      limit,
      order: [
        ["productId", "DESC"],
        ["exchangeValue", "DESC"],
      ],
    }),
    models.ProductUnit.count({ where }),
  ]);
  for (const item of items) {
    item.dataValues.productUnit = {
      id: item.id,
      unitName: item.unitName,
      exchangeValue: item.exchangeValue,
      price: item.price,
      productId: item.productId,
      code: item.code,
      barCode: item.barCode,
      isDirectSale: item.isDirectSale,
      isBaseUnit: item.isBaseUnit,
      point: item.point,
    };
    const inventory = await getInventory(branchId, item.productId)
    item.dataValues.product.dataValues.quantity = parseInt(inventory);
    item.dataValues.product.dataValues.quantity = parseInt(item.dataValues.product.dataValues.quantity);
    item.dataValues.quantity = parseInt(
      inventory / item.exchangeValue
    );

    if (!params.isSale) {
      item.dataValues.batches = [];
      continue;
    }
    item.dataValues.batches = await findAllBatchByProductId(item.productId, branchId);
  }

  return {
    success: true,
    data: {
      items,
      totalItem: count,
    },
  };
}

export async function indexMasterInboundProducts(params) {
  const limit = +params.limit || 10;
  const page = +params.page || 1;
  const { storeId, branchId } = params;
  const where = {};
  if (storeId) {
    where.storeId = storeId;
  }
  if (params.keyword) {
    const keyword = params.keyword
    const _products = await models.Product.findAll({
      attributes: ['id'],
      where: {
        [Op.or]: {
          name: {
            [Op.like]: `%${keyword.trim()}%`,
          },
          slug: {
            [Op.like]: `%${keyword.trim()}%`,
          }
        }
      }
    })
    const productIds = _products.map(x => x.id)
    where[Op.or] = {
      code: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      barCode: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      productId: {
        [Op.in]: productIds
      }
    }
  }
  const { rows, count } = await models.ProductUnit.findAndCountAll({
    attributes: ["id",
      "unitName",
      "exchangeValue",
      "price",
      "productId",
      "code",
      "barCode",
      "isDirectSale",
      "isBaseUnit",
      "point",
      "storeId",
      "branchId",
      "createdAt"
    ],
    include: [
      {
        model: models.Product,
        as: "product",
        attributes: productAttributes,
        include: productIncludes.filter(
          (productInclude) => !ignoreAliasModels.includes(productInclude.as)
        ),
      },
      ...productMasterIncludes,
    ],
    where: where,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["createdAt", "DESC"]]
  });
  for (const item of rows) {
    const inventory = (await getInventory(branchId, item.productId)) || 0
    if (item.dataValues.product)
      item.dataValues.product.dataValues.quantity = parseInt(inventory);
    item.dataValues.quantity = parseInt(
      inventory / item.exchangeValue
    );
  }
  return {
    success: true,
    data: {
      items: rows
    },
  };
}

export async function detailMaster(query) {
  return await models.ProductMaster.findOne({
    attributes: [
      "storeId",
      "branchId",
      "productId",
      "productUnitId",
      "quantity",
    ],
    where: {
      productUnitId: query.productUnitId
    }
  })
}
