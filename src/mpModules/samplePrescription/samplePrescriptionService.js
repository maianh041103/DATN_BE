import { findAllBatchByProductId } from "../batch/batchService";
import { getInventory } from "../inventory/inventoryService";

const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { createUserTracking } = require("../behavior/behaviorService");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { productIncludes } = require("../product/filter");

const samplePrescriptionIncludes = [
  {
    model: models.User,
    as: "user",
    attributes: ["id", "username", "email", "fullName", "avatarId", "phone"],
  },
  {
    model: models.Image,
    as: "image",
    attributes: ["id", "originalName", "fileName", "filePath", "path"],
  },
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
  {
    model: models.Position,
    as: "position",
    attributes: ["id", "name"],
  },
];

const productAttributes = [
  "id",
  "name",
  "shortName",
  "code",
  "barCode",
  "groupProductId",
  "productCategoryId",
  "imageId",
  "dosageId",
  "manufactureId",
  "positionId",
  "countryId",
  "primePrice",
  "price",
  "weight",
  "warningExpiryDate",
  "warningExpiryText",
  "isDirectSale",
  "registerNumber",
  "activeElement",
  "content",
  "packingSpecification",
  "minInventory",
  "maxInventory",
  "description",
  "note",
  "baseUnit",
  "inventory",
  "quantitySold",
  "storeId",
  "branchId",
  "type",
  "isLoyaltyPoint",
  "isBatchExpireControl",
  "expiryPeriod",
  "status",
  "createdAt",
];

const productUnitAttributes = [
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
];

const samplePrescriptionToProductAttributes = [
  "id",
  "samplePrescriptionId",
  "productId",
  "productUnitId",
  "dosage",
  "quantity",
  "storeId",
  "branchId",
  "createdAt",
];

function queryFilter(params) {
  const {
    keyword = "",
    page = 1,
    limit = 10,
    status,
    attributes = [
      "id",
      "name",
      "code",
      "weight",
      "description",
      "status",
      "positionId",
      "createdBy"
    ],
    include = samplePrescriptionIncludes,
    storeId,
    branchId,
    positionId,
    createdBy
  } = params;

  const conditions = {};
  if (keyword) {
    conditions[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      code: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }

  if (storeId) {
    conditions.storeId = storeId;
  }

  if (branchId) {
    conditions.branchId = branchId;
  }

  if (typeof status !== "undefined") conditions.status = status;

  if (positionId) {
    conditions.positionId = positionId
  }

  if (createdBy) {
    conditions.createdBy = createdBy
  }

  return {
    attributes,
    include,
    where: conditions,
    limit: +limit,
    offset: +limit * (+page - 1),
    order: [["displayOrder", "ASC"]],
  };
}

async function readSamplePrescriptionProduct(samplePrescriptionId) {
  return await models.SamplePrescriptionToProduct.findAll({
    attributes: samplePrescriptionToProductAttributes,
    include: [
      {
        model: models.Product,
        as: "product",
        attributes: productAttributes,
      },
      {
        model: models.ProductUnit,
        as: "productUnit",
        attributes: productUnitAttributes,
      },
    ],
    where: {
      samplePrescriptionId,
    },
  });
}

export async function indexService(params) {
  const { rows, count } = await models.SamplePrescription.findAndCountAll(
    queryFilter(params)
  );
  const { storeId, branchId } = params;
  for (const row of rows) {
    const products = await readSamplePrescriptionProduct(row.id);
    let totalQuantity = 0;
    for (const item of products) {
      item.dataValues.batches = [];
      if (!params.isSale) {
        continue;
      }
      const inventory = await getInventory(branchId, item.productId)
      item.dataValues.quantity = parseInt(
        inventory / item.exchangeValue
      );
      totalQuantity += parseInt(inventory);
      item.dataValues.batches = await findAllBatchByProductId(item.productId, branchId);
      if (item.dataValues.batches.length > 0) {
        totalQuantity = 0;
        totalQuantity += item.dataValues.batches.reduce((calc, item) => {
          return calc + item.quantity;
        }, 0);
      }
      item.quantity = totalQuantity;
    }
    row.dataValues.products = products;
  }

  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,
    },
  };
}

export async function readService(id, loginUser) {
  const instance = await models.SamplePrescription.findOne({
    include: samplePrescriptionIncludes,
    where: {
      id: id,
      ...(loginUser && {
        storeId: loginUser.storeId,
      }),
    },
  });

  if (!instance) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Không tồn tại đơn thuốc mẫu",
    };
  }

  // Update code SamplePrescription
  if (!instance.code) {
    await models.SamplePrescription.update(
      {
        code: generateSamplePrescriptionCode(instance.id),
      },
      {
        where: {
          id: instance.id,
        },
      }
    );
  }

  instance.dataValues.products = await readSamplePrescriptionProduct(
    instance.id
  );

  return {
    success: true,
    data: instance,
  };
}

function generateSamplePrescriptionCode(no) {
  if (no <= 0) return "DTM000000000";
  if (no < 10) return `DTM00000000${no}`;
  if (no < 100) return `DTM0000000${no}`;
  if (no < 1000) return `DTM000000${no}`;
  if (no < 10000) return `DTM00000${no}`;
  if (no < 100000) return `DTM0000${no}`;
  if (no < 1000000) return `DTM000${no}`;
  if (no < 10000000) return `DTM00${no}`;
  if (no < 100000000) return `DTM0${no}`;
  if (no < 1000000000) return `DTM${no}`;
  return no;
}

export async function createService(payload, ingredientProducts, loginUser) {
  try {
    return await handleCreateSamplePrescription(
      payload,
      ingredientProducts,
      loginUser
    );
  } catch (e) {
    let errorRes = {};
    try {
      errorRes = JSON.parse(e.message);
    } catch {
      errorRes = {};
    }
    if (errorRes.error) {
      return errorRes;
    }

    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

async function handleCreateSamplePrescription(
  payload,
  ingredientProducts,
  loginUser
) {
  const nameCheckExist = await checkUniqueValue("SamplePrescription", {
    name: payload.name,
    branchId: payload.branchId,
    storeId: loginUser.storeId,
  });

  if (!nameCheckExist) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên đơn thuốc mẫu đã tồn tại`,
    };
  }

  // check code is unique?
  if (payload.code) {
    const codeCheckExist = await checkUniqueValue("SamplePrescription", {
      code: payload.code,
      branchId: payload.branchId,
      storeId: loginUser.storeId,
    });

    if (!codeCheckExist) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Mã đơn thuốc mẫu đã tồn tại`,
      };
    }
  }

  let instance = null;
  await models.sequelize.transaction(async (transaction) => {
    instance = await models.SamplePrescription.create(payload, {
      transaction,
    });
    // create SamplePrescriptionToProduct
    const ingredientProductsPayload = [];
    for (const item of ingredientProducts) {
      const findProduct = await models.Product.findOne({
        where: {
          id: item.productId,
          storeId: loginUser.storeId,
        },
      });
      if (!findProduct) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Sản phẩm có id = ${item.productId} không tồn tại`,
          })
        );
      }

      const findProductUnit = await models.ProductUnit.findOne({
        where: {
          id: item.productUnitId,
          productId: item.productId,
        },
      });
      if (!findProductUnit) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Đơn vị sản phẩm không tồn tại`,
          })
        );
      }

      ingredientProductsPayload.push({
        samplePrescriptionId: instance.id,
        productId: item.productId,
        productUnitId: item.productUnitId,
        dosage: item.dosage,
        price: item.price,
        quantity: item.quantity,
        branchId: payload.branchId,
        storeId: loginUser.storeId,
      });
    }
    await models.SamplePrescriptionToProduct.bulkCreate(
      ingredientProductsPayload,
      {
        transaction,
      }
    );

    // Update code SamplePrescription
    await models.SamplePrescription.update(
      {
        code: generateSamplePrescriptionCode(instance.id),
      },
      {
        where: {
          id: instance.id,
        },
        transaction,
      }
    );

    createUserTracking({
      accountId: instance.createdBy,
      type: accountTypes.USER,
      objectId: instance.id,
      action: logActions.sample_prescription_create.value,
      data: { payload, ingredientProducts },
    });
  });

  return {
    success: true,
    data: instance,
  };
}

export async function updateService(
  id,
  payload,
  ingredientProducts,
  loginUser
) {
  try {
    return await handleUpdateSamplePrescription(
      id,
      payload,
      ingredientProducts,
      loginUser
    );
  } catch (e) {
    console.log(e);
    let errorRes = {};
    try {
      errorRes = JSON.parse(e.message);
    } catch {
      errorRes = {};
    }
    if (errorRes.error) {
      return errorRes;
    }

    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

async function handleUpdateSamplePrescription(
  id,
  payload,
  ingredientProducts,
  loginUser
) {
  const nameCheckExist = await checkUniqueValue("SamplePrescription", {
    name: payload.name,
    branchId: payload.branchId,
    storeId: loginUser.storeId,
    id: {
      [Op.ne]: id,
    },
  });

  if (!nameCheckExist) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên đơn thuốc mẫu đã tồn tại`,
    };
  }

  if (payload.code) {
    const codeCheckExist = await checkUniqueValue("SamplePrescription", {
      code: payload.code,
      branchId: payload.branchId,
      storeId: loginUser.storeId,
      id: {
        [Op.ne]: id,
      },
    });

    if (!codeCheckExist) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Mã đơn thuốc mẫu đã tồn tại`,
      };
    }
  }

  await models.sequelize.transaction(async (transaction) => {
    await models.SamplePrescription.update(payload, {
      where: {
        id,
      },
      transaction,
    });

    // update SamplePrescriptionToProduct
    const ingredientProductsPayload = [];
    for (const item of ingredientProducts) {
      const findProduct = await models.Product.findOne({
        where: {
          id: item.productId,
          storeId: loginUser.storeId,
        },
      });
      if (!findProduct) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Sản phẩm có id = ${item.productId} không tồn tại`,
          })
        );
      }

      const findProductUnit = await models.ProductUnit.findOne({
        where: {
          id: item.productUnitId,
          productId: item.productId,
        },
      });
      if (!findProductUnit) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Đơn vị sản phẩm không tồn tại`,
          })
        );
      }

      ingredientProductsPayload.push({
        samplePrescriptionId: id,
        productId: item.productId,
        productUnitId: item.productUnitId,
        dosage: item.dosage,
        quantity: item.quantity,
        branchId: payload.branchId,
        storeId: loginUser.storeId,
      });
    }

    await Promise.all([
      models.SamplePrescriptionToProduct.destroy({
        where: {
          samplePrescriptionId: id,
        },
        transaction,
      }),
      models.SamplePrescriptionToProduct.bulkCreate(ingredientProductsPayload, {
        transaction,
      }),
    ]);

    createUserTracking({
      accountId: loginUser.id,
      type: accountTypes.USER,
      objectId: id,
      action: logActions.sample_prescription_create.value,
      data: { payload, ingredientProducts },
    });
  });

  return {
    success: true,
    data: await readService(id),
  };
}

export async function updateStatusService(id, status, loginUser) {
  if (!id || typeof status === "undefined") {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
    };
  }

  await models.SamplePrescription.update(
    { status: status },
    {
      where: {
        id: id,
      },
    }
  );

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.sample_prescription_update.value,
    data: { id, status },
  });

  return {
    success: true,
  };
}

export async function deleteService(id, loginUser) {
  const findSamplePrescription = await models.SamplePrescription.findByPk(id);
  if (!findSamplePrescription) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Đơn thuốc mẫu không tồn tại",
    };
  }

  await models.SamplePrescription.destroy({ where: { id } });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: findSamplePrescription.id,
    action: logActions.sample_prescription_delete.value,
    data: { id, name: findSamplePrescription.name },
  });

  return {
    success: true,
  };
}
