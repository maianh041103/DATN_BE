import { raiseBadRequestError } from "../../helpers/exception";

const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");
const { readBranch } = require("../branch/branchService");
const { readProduct } = require("../product/productService");

const attributes = [
  "id",
  "name",
  "storeId",
  "branchId",
  "productId",
  "quantity",
  "expiryDate",
  "oldQuantity"
];

export async function isExistBatch(id) {
  return !!(await models.Batch.findOne({ where: { id } }));
}

function processBuildQuery(params) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    storeId,
    branchId,
    productId
  } = params;
  const query = {
    attributes,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
    raw: true,
  };
  const where = {
    isUsed: {
      [Op.ne]: true,
    },
  };
  if (keyword) {
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  if (storeId) where.storeId = storeId;
  if (branchId) where.branchId = branchId;
  if (productId) where.productId = productId;

  query.where = where;

  return query;
}

export async function batchFilter(params) {
  try {
    return await models.Batch.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexBatches(params) {
  const { storeId, branchId, productId, productUnitId } = params;
  const { rows, count } = await models.Batch.findAndCountAll(
    processBuildQuery(params)
  );
  if (storeId && branchId && productId) {
    const findAllProductUnits = await models.ProductUnit.findAll({
      where: {
        storeId,
        branchId,
        productId,
      },
    });
    const productUnitMapping = {};
    findAllProductUnits.forEach((item) => {
      productUnitMapping[`${productId}_${item.id}`] = item.exchangeValue;
    });
    for (const item of rows) {
      let inventory = 0;
      const findAllProductBatches = await models.ProductToBatch.findAll({
        where: {
          storeId: item.storeId,
          branchId: item.branchId,
          productId: item.productId,
          batchId: item.id,
        },
      });
      for (const productBatch of findAllProductBatches) {
        inventory +=
          productBatch.quantity *
          (productUnitMapping[`${productId}_${productBatch.productUnitId}`] ||
            0);
      }
      item.inventory = inventory;
    }
  }
  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,
    },
  };
}

export async function createBatch(payload, loginUser) {
  const isUniqueValue = await checkUniqueValue("Batch", {
    name: payload.name,
    productId: payload.productId,
    storeId: payload.storeId,
    branchId: payload.branchId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên lô ${payload.name} đã tồn tại, vui lòng nhập tên khác`,
    };
  }

  const responseReadBranch = await readBranch(payload.branchId, loginUser);
  if (responseReadBranch.error) {
    return responseReadBranch;
  }

  const responseReadProduct = await readProduct(payload.productId, loginUser);
  if (responseReadProduct.error) {
    return responseReadProduct;
  }

  const newBatch = await models.Batch.create({ ...payload, quantity: 0, oldQuantity: 0 });

  createUserTracking({
    accountId: newBatch.createdBy,
    type: accountTypes.USER,
    objectId: newBatch.id,
    action: logActions.batch_create.value,
    data: payload,
  });
  return {
    success: true,
    data: newBatch,
  };
}

export async function updateBatch(id, batch, loginUser) {
  const findBatch = await models.Batch.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findBatch) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Lô không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("Batch", {
    name: batch.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Lô ${batch.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.Batch.update(batch, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: batch.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.batch_update.value,
    data: { id, ...batch },
  });

  return {
    success: true,
  };
}

export async function findAllBatchByProductId(productId, branchId) {
  let where = {
    productId: productId,
    quantity: { [Op.gt]: 0 }
  }
  if(branchId){
    where.branchId = branchId;
  }
  return await models.Batch.findAll({
    attributes: ["id", "name", "expiryDate", "quantity"],
    where,
    order: [["expiryDate", "ASC"]]
  });
}

export async function findAllBatchByListProduct(productIds) {
  const res = {}
  const batches = await models.Batch.findAll({
    attributes: ["id", "name", "expiryDate", "quantity", "productId"],
    where: {
      productId: { [Op.in]: productIds },
      quantity: { [Op.gt]: 0 }
    },
    order: [["expiryDate", "ASC"]]
  });
  for (const batch of batches) {
    res[batch.productId] = batch
  }
  return res
}
export async function readBatch(id, loginUser) {
  const findBatch = await models.Batch.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!findBatch) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Lô id=${id} không tồn tại`,
    };
  }
  return {
    success: true,
    data: findBatch,
  };
}

export async function deleteBatch(id, loginUser) {
  const findBatch = await models.Batch.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!findBatch) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Lô không tồn tại",
    };
  }

  await models.Batch.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.batch_delete.value,
    data: { id, name: findBatch.name, storeId: findBatch.storeId },
  });

  return {
    success: true,
  };
}

export async function getBatch(id) {
  const batch = await models.Batch.findOne({
    where: { id: id }
  })
  if (!batch) {
    raiseBadRequestError("Không tìm thấy lô sản phẩm")
  }
  return batch
}

export async function addBatchQty(id, quantity, t) {
  await models.Batch.increment({
    quantity: quantity
  }, { where: { id: id }, transaction: t })
}

export async function getOrCreateBatch(storeId, branchId, productId, name, expiryDate, t) {
  let batch = await models.Batch.findOne({
    where: {
      storeId: storeId,
      branchId: branchId,
      productId: productId,
      name: name,
      expiryDate: expiryDate
    }
  })
  if (!batch) {
    batch = await models.Batch.create({
      storeId, branchId, productId, name, expiryDate, quantity: 0, oldQuantity: 0
    }, { transaction: t })
  }
  return batch
}
