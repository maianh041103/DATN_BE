const { createUserTracking } = require("../behavior/behaviorService");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions, ACTIVE } = require("../../helpers/choices");
const { typeConfigOptions } = require("./configurationConstant");
const { orderStatuses, orderStatusOptions, paymentTypes, discountTypes } = require("../order/orderConstant");
const { productTypes, productPriceSettingTypes, productStatuses } = require("../product/productConstant");

export async function configurationFilter(params) {
  const { page = 1, limit = 10, keyword = "", type, status } = params;

  const query = {
    attributes: ["id", "key", "value", "displayOrder"],
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["displayOrder", "ASC"]],
    raw: true,
  };

  const where = {};
  if (keyword) {
    where[Op.or] = {
      key: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      value: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }

  if (typeof type !== "undefined") {
    where.type = type;
  } else {
    where.type = typeConfigOptions.PUBLIC;
  }

  if (typeof status !== "undefined") {
    where.status = status;
  } else {
    where.status = ACTIVE;
  }

  query.where = where;

  return await models.Configuration.findAll(query);
}

export async function indexConfigurations(params) {
  if ([undefined, null, 0].includes(params.type)) {
    return {
      success: true,
      data: {
        order: {
          orderStatuses,
          orderStatusOptions,
          paymentTypes,
          discountTypes
        },
        product: {
          productTypes,
          productPriceSettingTypes,
          productStatuses
        }
      },
    };
  }
  return {
    success: true,
    data: {
      items: await configurationFilter(params),
    },
  };
}

export async function createConfiguration(params) {
  const instance = await models.Configuration.create({
    ...params,
    ...(params.value && { value: JSON.stringify(params.value) }),
  });

  createUserTracking({
    accountId: instance.createdBy,
    type: accountTypes.USER,
    objectId: instance.id,
    action: logActions.config_create.value,
    data: params,
  });

  return {
    success: true,
    data: instance,
  };
}

export async function updateConfiguration(id, params) {
  const findConfiguration = await models.Configuration.findByPk(id, {
    attributes: ["id"],
  });

  if (!findConfiguration) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Tham số không tồn tại",
    };
  }

  await models.Configuration.update(params, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: params.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.config_update.value,
    data: { id, ...params },
  });

  return {
    success: true,
  };
}

export async function readConfiguration(id) {
  return {
    success: true,
    data: await models.Configuration.findByPk(id, {
      where: {
        id: id,
      },
    }),
  };
}

export async function deleteConfiguration(id, loginUser) {
  const instance = await models.Configuration.findByPk(id, {
    attributes: ["id", "key", "value"],
  });

  if (!instance) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Tham số không tồn tại",
    };
  }

  await models.Configuration.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: instance.id,
    action: logActions.config_delete.value,
    data: { ...instance },
  });

  return {
    success: true,
  };
}
