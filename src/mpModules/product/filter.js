import {
  filterInventories,
  productAttributes,
  productIncludes,
} from "./constant";
import models from "../../../database/models";
import { productStatisticFilter } from "../productStatistic/productStatisticService";
import { Op } from "sequelize";
import { getInventory } from "../inventory/inventoryService";
const _ = require("lodash");

export function getInventoryInclude(branchId, inventoryType) {
  const invInclude = {
    model: models.Inventory,
    as: 'inventories',
    required: true,
    where: {
      branchId: branchId,
    }
  }
  const type = parseInt(inventoryType);
  if (type === 1) {
    invInclude.where['quantity'] = {
      [Op.lte]: models.Sequelize.col("Product.minInventory")
    }
  } else if (type === 2) {
    invInclude.where['quantity'] = {
      [Op.gte]: models.Sequelize.col("Product.maxInventory")
    }
  } else if (type === 3) {
    invInclude.where['quantity'] = {
      [Op.gt]: 0
    }
  } else if (type === 4) {
    invInclude.where['quantity'] = {
      [Op.lte]: 0
    }
  }
  return invInclude;
}

export async function queryFilter(params) {
  const {
    page = 1,
    limit = 20,
    keyword = "",
    name = "",
    type,
    status,
    productCategoryId,
    groupProductId,
    statusArray = [],
    unitId,
    manufactureId,
    notEqualManufactureId,
    listProductId,
    notEqualId,
    order = [["id", "DESC"]],
    tag,
    newest,
    bestseller,
    az,
    za,
    price,
    raw = false,
    storeId,
    isSale,
    branchId,
    inventoryType,
      listProductUnitId
  } = params;

  const query = {
    offset: +limit * (+page - 1),
    limit: +limit,
    order,
  };

  const include = _.cloneDeep(productIncludes);

  if(listProductUnitId){
    let productUnitInclude = include.find((item,index)=>{
      return item.as === 'productUnit';
    });
    if(productUnitInclude){
      productUnitInclude.where = {
        id:{
          [Op.in]:listProductUnitId.split(",")
        }
      }
    }
  }

  const attributes = [...productAttributes];

  if (raw) query.raw = true;

  if (_.isArray(include) && include.length) {
    query.include = include;
    if (!isSale) {
      for (const item of query.include) {
        if (item.as === "productUnit") {
          query.order = [
            [models.ProductUnit, "exchangeValue", "DESC"],
            ...query.order,
          ];
        }
      }
    }
  }

  if (_.isArray(attributes) && attributes.length) {
    query.attributes = attributes;
  }

  if (_.isArray(order) && order.length) {
    query.order = order;
  }
  const where = {};

  if (storeId) {
    where.storeId = storeId;
  }

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (groupProductId) {
    where.groupProductId = groupProductId;
  }

  if (productCategoryId) {
    where.productCategoryId = productCategoryId;
  }

  if (notEqualId) {
    where.id = {
      [Op.ne]: notEqualId,
    };
  }

  if (notEqualManufactureId) {
    where.manufactureId = {
      [Op.ne]: notEqualManufactureId,
    };
  }

  if (_.isArray(statusArray) && statusArray.length) {
    where.status = {
      [Op.in]: statusArray,
    };
  }

  if (_.isArray(unitId) && unitId.length) {
    where.unitId = {
      [Op.in]: unitId,
    };
  }

  if (_.isArray(manufactureId) && manufactureId.length) {
    where.manufactureId = {
      [Op.in]: manufactureId,
    };
  }

  if(listProductId){
    let ids = listProductId.split(",");
    where.id = {
      [Op.in]:ids
    }
  }

  if (_.isArray(listProductId) && listProductId.length) {
    where.id = listProductId;
  }

  if (tag) {
    const tagToProducts = await tagToProductFilter({ tag });
    where.id = tagToProducts;
  }
  if (keyword) {
    let productId = null;
    const productIdByCodeProductUnit = ((await models.ProductUnit.findOne({
      where: {
        code: {
          [Op.like]: `%${keyword.trim()}%`,
        },
        storeId: storeId
      }
    })));
    if (productIdByCodeProductUnit) {
      productId = productIdByCodeProductUnit.productId;
    }
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      slug: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      barCode: {
        [Op.like]: `%${keyword.trim()}%`
      }
    };
    if (productId) {
      where[Op.or].id = productId;
    }
  }

  if (name) {
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }

  if (newest) {
    query.order = [["id", "DESC"]];
  } else if (bestseller) {
    where.id = _.get(
      await productStatisticFilter({
        limit: 20,
        orderBy: [["sold", "DESC"]],
      }),
      "statistics",
      []
    ).map((o) => o.productId);
  } else if (az) {
    query.order = [["name", "ASC"]];
  } else if (za) {
    query.order = [["name", "DESC"]];
  } else if (price == "desc") {
    query.order = [["cost", "DESC"]];
  } else if (price == "asc") {
    query.order = [["cost", "ASC"]];
  }

  if (branchId && inventoryType) {
    const invInclude = getInventoryInclude(branchId, inventoryType);
    include.push(invInclude)
  }
  query.where = where;

  return query;
}
