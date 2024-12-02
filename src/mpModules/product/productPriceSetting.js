const Sequelize = require("sequelize");
const { Op } = Sequelize;
const _ = require("lodash");
const models = require("../../../database/models");
const { readProduct } = require("./productService");
const { productPriceSettingTypes } = require("./productConstant");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexProductPriceSettings(params, loginUser) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    productName = "",
    branchId,
    storeId,
  } = params;
  const query = {
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
    include: [
      {
        model: models.Product,
        as: "product",
        attributes: ["id", "name", "code"]
      }
    ],
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
  };
  const where = {};
  if (storeId) {
    where.storeId = storeId;
  }
  if (keyword) {
    where[Op.or] = {
      code: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      barCode: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      '$product.name$': {
        [Op.like]: `%${keyword.trim()}%`,
      }
    };
  }

  query.where = where;


  const [items, count] = await Promise.all([
    models.ProductUnit.findAll(query),
    models.ProductUnit.count(query),
  ]);

  const productsInformation = {};
  for (const item of items) {
    item.dataValues.product = {};
    if (!productsInformation[item.productId]) {
      try {
        const res = await readProduct(item.productId, loginUser);
        productsInformation[item.productId] = res.data;
      } catch (error) {
        console.log("indexProductPriceSettings error", error);
      }
    }
    item.dataValues.product = productsInformation[item.productId];
  }

  return {
    success: true,
    data: {
      items,
      totalItem: count,
    },
  };
}

function calPriceValue(type, value, initPrice) {
  return type === productPriceSettingTypes.MONEY
    ? initPrice + value
    : initPrice + (initPrice * value) / 100;
}

export async function updateProductPriceSetting(id, payload, loginUser) {
  const findProductUnit = await models.ProductUnit.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findProductUnit) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Không tồn giá cho đơn vị sản phẩm",
    };
  }

  if (
    payload.type === productPriceSettingTypes.PERCENT &&
    (payload.value > 100 || payload.value < -100)
  ) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Phần trăm không hợp lệ`,
    };
  }

  if (!payload.isApplyForAll) {
    const value = calPriceValue(
      payload.type,
      payload.value,
      findProductUnit.price
    );
    await models.ProductUnit.update(
      {
        price: value < 0 ? 0 : value,
      },
      {
        where: {
          id,
        },
      }
    );

    createUserTracking({
      accountId: loginUser.id,
      type: accountTypes.USER,
      objectId: id,
      action: logActions.product_unit_update.value,
      data: { id, payload },
    });

    return {
      success: true,
    };
  }

  const productUnits = await models.ProductUnit.findAll({
    where: {
      storeId: loginUser.storeId,
      branchId: payload.branchId,
    },
  });
  for (const item of productUnits) {
    const value = calPriceValue(payload.type, payload.value, item.price);
    await models.ProductUnit.update(
      {
        price: value < 0 ? 0 : value,
      },
      {
        where: {
          id: item.id,
        },
      }
    );
    createUserTracking({
      accountId: loginUser.id,
      type: accountTypes.USER,
      objectId: id,
      action: logActions.product_unit_update.value,
      data: { id, payload, price: value < 0 ? 0 : value },
    });
  }

  return {
    success: true,
  };
}
