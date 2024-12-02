import { createWarehouseCard } from "../warehouse/warehouseService";
import { warehouseStatus } from "../warehouse/constant";
import { addInventory, getInventory } from "../inventory/inventoryService";
import { userAttributes } from "../user/attributes";

const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { readUser } = require("../user/userService");
const { readBranch } = require("../branch/branchService");
const { readSupplier } = require("../supplier/supplierService");
const { readBatch } = require("../batch/batchService");
const { readProductUnit } = require("../product/productUnitService");
const {
  purchaseReturnStatus,
} = require("../purchaseReturn/purchaseReturnConstant");
const {
  addFilterByDate,
  formatDecimalTwoAfterPoint,
} = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");
const transactionContant = require("../transaction/transactionContant");
const transactionService = require("../transaction/transactionService");
const userLogContant = require("../userLog/userLogContant");

const purchaseReturnIncludes = [
  {
    model: models.Store,
    as: "store",
    attributes: ["id", "name", "phone", "address"],
  },
  {
    model: models.Branch,
    as: "branch",
    attributes: ["id", "name", "phone", "code", "zipCode", "isDefaultBranch"],
  },
  {
    model: models.User,
    as: "user",
    attributes: userAttributes,
  },
  {
    model: models.User,
    as: "creator",
    attributes: userAttributes,
  },
  {
    model: models.Supplier,
    as: "supplier",
    attributes: [
      "id",
      "name",
      "phone",
      "email",
      "code",
      "taxCode",
      "provinceId",
      "districtId",
      "wardId",
      "address",
      "companyName",
      "groupSupplierId",
      "storeId",
      "note",
      "createdAt",
    ],
    include: [
      {
        model: models.GroupSupplier,
        as: "groupSupplier",
        attributes: ["id", "name", "description", "storeId"],
      },
      {
        model: models.Province,
        as: "province",
        attributes: ["id", "name"],
      },
      {
        model: models.District,
        as: "district",
        attributes: ["id", "name"],
      },
      {
        model: models.Ward,
        as: "ward",
        attributes: ["id", "name"],
      },
    ],
  },
  {
    model:models.PurchaseReturnToProduct,
    as:"products",
    attributes: ["id","importPrice","discount","quantity"],
    include:[
        {
      model:models.Product,
      as:"product",
      attributes: ["id", "name","code","primePrice"],
      },
      {
        model:models.ProductUnit,
        as:"productUnit",
        attributes: ["unitName"]
      },
      {
        model:models.PurchaseReturnItemBatch,
        as:"batches",
        attributes: ["id","batchId","quantity"],
        include:[{
          model:models.Batch,
          as:"batch",
          attributes: ["id","name","expiryDate","quantity"],
        }]
      }
    ]
  }
];

const purchaseReturnAttributes = [
  "id",
  "code",
  "description",
  "userId",
  "storeId",
  "branchId",
  "totalPrice",
  "paid",
  "debt",
  "discount",
  "supplierId",
  "status",
  "createdAt",
  "updatedAt",
  [Sequelize.literal(`(SELECT COUNT(purchase_return_to_products.id) FROM purchase_return_to_products 
  WHERE purchase_return_to_products.purchaseReturnId = PurchaseReturn.id
  AND purchase_return_to_products.deletedAt IS NULL)`), 'countProduct'],
  [Sequelize.literal(`(SELECT SUM(purchase_return_to_products.quantity) FROM purchase_return_to_products 
  WHERE purchase_return_to_products.purchaseReturnId = PurchaseReturn.id
  AND purchase_return_to_products.deletedAt IS NULL)`), 'quantityProduct'],
];

const productAttributes = [
  "name",
  "shortName",
  "code",
  "barCode",
  "imageId",
  "isBatchExpireControl",
];

const purchaseReturnProductIncludes = [
  {
    model: models.Product,
    as: "product",
    attributes: productAttributes,
    include: [
      {
        model: models.Image,
        as: "image",
        attributes: ["id", "originalName", "fileName", "filePath", "path"],
      },
    ],
  },
  {
    model: models.ProductBatchHistory,
    as: "productBatchHistories",
    attributes: [
      "id",
      "storeId",
      "branchId",
      "productId",
      "batchId",
      "productUnitId",
      "quantity",
      "expiryDate",
      "importPrice",
      "discount",
      "totalPrice",
    ],
    include: [
      {
        model: models.Batch,
        as: "batch",
        attributes: ["id", "name", "quantity", "expiryDate"],
        order: [["expiryDate", "ASC"]],
      },
      {
        model: models.ProductUnit,
        as: "productUnit",
        attributes: ["id", "unitName", "exchangeValue", "price", "isBaseUnit"],
      },
    ],
  },
];

export async function indexPurchaseReturns(params, loginUser) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    code = "",
    userId,
    branchId,
    storeId,
    createdAt = [],
    status,
    statuses = [],
    paymentType,
    creatorId,
    supplierId,
  } = params;

  const query = {
    attributes: purchaseReturnAttributes,
    offset: +limit * (+page - 1),
    include: purchaseReturnIncludes,
    limit: +limit,
    order: [["id", "DESC"]],
  };

  const where = {
    status: {
      [Op.ne]: purchaseReturnStatus.TRASH,
    },
  };

  if (storeId) {
    where.storeId = storeId;
  }

  if (branchId) {
    where.branchId = branchId;
  }

  if (status) {
    where.status = status;
  }

  if (code) {
    where.code = status;
  }

  if (keyword) {
    where.code = {
      [Op.like]: `%${keyword.trim()}%`,
    };
  }

  if (_.isArray(statuses) && statuses.length) {
    where.status = {
      [Op.in]: statuses,
    };
  }

  if (_.isArray(createdAt) && createdAt.length) {
    where.createdAt = addFilterByDate(createdAt);
  }

  if (paymentType) {
    where.paymentType = paymentType;
  }

  if (userId) {
    where.userId = userId;
  }

  if (creatorId) {
    where.createdBy = creatorId;
  }

  if (supplierId) {
    where.supplierId = supplierId;
  }

  if (params.dateRange) {
    try {
      const dateRange = JSON.parse(params.dateRange);
      const { startDate, endDate } = dateRange;
      where.createdAt = addFilterByDate([startDate, endDate]);
    } catch (e) { }
  }

  query.where = where;

  const [items, totalItem] = await Promise.all([
    models.PurchaseReturn.findAll(query),
    models.PurchaseReturn.count(query),
  ]);

  return {
    success: true,
    data: {
      items,
      totalItem,
    },
  };
}

export async function readPurchaseReturn(id, loginUser) {
  const findPurchaseReturn = await models.PurchaseReturn.findOne({
    include: purchaseReturnIncludes,
    attributes: purchaseReturnAttributes,
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findPurchaseReturn) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Phiếu trả hàng không tồn tại",
    };
  }

  const products = await models.PurchaseReturnToProduct.findAll({
    attributes: ["id", "productId", "purchaseReturnId", "quantity", "importPrice", "discount", "totalPrice", "productUnitId"],
    include: [
      {
        model: models.Product,
        as: "product",
        attributes: ["id", "name", "shortName", "code", "barCode", "imageId", "isBatchExpireControl"],
        include: [
          {
            model: models.Image,
            as: "image",
            attributes: ["id", "originalName", "fileName", "filePath", "path"],
          },
        ],
      },
      {
        model: models.ProductUnit,
        as: "productUnit",
        attributes: ["id", "exchangeValue", "unitName", "price", "code", "barCode", "isBaseUnit"]
      },
      {
        model: models.PurchaseReturnItemBatch,
        as: "batches",
        attributes: ["id", "batchId", "quantity"],
        include: [{
          model: models.Batch,
          as: "batch",
          attributes: ["id", "name", "quantity", "expiryDate"],
        }]
      }
    ],
    where: {
      purchaseReturnId: id,
    },
  });

  return {
    success: true,
    data: {
      purchaseReturn: findPurchaseReturn,
      products,
    },
  };
}

function generatePurchaseReturnCode(no) {
  if (no <= 0) return "TSP000000000";
  if (no < 10) return `TSP00000000${no}`;
  if (no < 100) return `TSP0000000${no}`;
  if (no < 1000) return `TSP000000${no}`;
  if (no < 10000) return `TSP00000${no}`;
  if (no < 100000) return `TSP0000${no}`;
  if (no < 1000000) return `TSP000${no}`;
  if (no < 10000000) return `TSP00${no}`;
  if (no < 100000000) return `TSP0${no}`;
  if (no < 1000000000) return `TSP${no}`;
  return no;
}

export async function createPurchaseReturn(purchaseReturn, loginUser) {
  return await handleCreatePurchaseReturn(purchaseReturn, loginUser);
}

export async function handleCreatePurchaseReturn(purchaseReturn, loginUser) {
  if (!purchaseReturn.products || !purchaseReturn.products.length) {
    throw Error(
      JSON.stringify({
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Bạn cần chọn sản phẩm để tiến hành trả hàng`
      })
    );
  }

  // Validate thông tin nhà cung cấp, nhân viên, chi nhánh
  const [responseReadSupplier, responseReadUser, responseReadBranch] =
    await Promise.all([
      readSupplier(purchaseReturn.supplierId, loginUser),
      readUser(purchaseReturn.userId, loginUser),
      readBranch(purchaseReturn.branchId, loginUser),
    ]);
  if (responseReadSupplier.error) {
    return responseReadSupplier;
  }
  if (responseReadUser.error) {
    return responseReadUser;
  }
  if (responseReadBranch.error) {
    return responseReadBranch;
  }

  // Validate thông tin sản phẩm, lô
  const supplier = responseReadSupplier.data

  let newPurchaseReturn;
  await models.sequelize.transaction(async (t) => {
    // Tạo nháp phiếu trả hàng
    newPurchaseReturn = await models.PurchaseReturn.create(
      {
        userId: purchaseReturn.userId,
        supplierId: purchaseReturn.supplierId,
        totalPrice: purchaseReturn.totalPrice || 0,
        discount: purchaseReturn.discount || 0,
        debt: purchaseReturn.debt || 0,
        paid: purchaseReturn.paid || 0,
        status: purchaseReturnStatus.TRASH,
        description: purchaseReturn.description,
        storeId: loginUser.storeId,
        branchId: purchaseReturn.branchId,
        createdBy: loginUser.id,
      },
      { transaction: t }
    );
    let sumPrice = 0;
    for (const item of purchaseReturn.products) {
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
      const totalProductPrice =
        item.importPrice * item.totalQuantity - (item.discount || 0);
      if (totalProductPrice !== item.totalPrice) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Sản phẩm (${item.productId}) có mã ${findProduct.code} sai thông tin về số lượng, đơn giá, giảm giá và thành tiền`,
          })
        );
      }

      const responseReadProductUnit = await readProductUnit(item.productUnitId, loginUser)
      if (responseReadProductUnit.error) {
        return responseReadProductUnit;
      }
      const productUnit = responseReadProductUnit.data
      const inventory = await models.Inventory.findOne({
        where:{
          productId: item.productId,
          branchId: purchaseReturn.branchId
        }
      });
      if(inventory < productUnit.exchangeValue * item.totalQuantity){
        throw Error(
            JSON.stringify({
              error: true,
              code: HttpStatusCode.BAD_REQUEST,
              message:"Hàng không còn đủ số lượng để trả"
            })
        )
      }

      await createWarehouseCard({
        code: generatePurchaseReturnCode(newPurchaseReturn.id),
        type: warehouseStatus.INBOUND_RETURN,
        partner: supplier.name,
        productId: item.productId,
        branchId: purchaseReturn.branchId,
        changeQty: -item.totalQuantity * productUnit.exchangeValue,
        remainQty: parseInt(await getInventory(purchaseReturn.branchId, item.productId)) - parseInt(item.totalQuantity * productUnit.exchangeValue),
        createdAt: new Date(),
        updatedAt: new Date()
      }, t)
      await addInventory(purchaseReturn.branchId, item.productId, -item.totalQuantity * productUnit.exchangeValue, t)
      const purchaseReturnItem = await models.PurchaseReturnToProduct.create(
        {
          storeId: loginUser.storeId,
          branchId: purchaseReturn.branchId,
          purchaseReturnId: newPurchaseReturn.id,
          productId: item.productId,
          productUnitId: item.productUnitId,
          quantity: item.totalQuantity,
          createdBy: newPurchaseReturn.createdBy,
          importPrice: item.importPrice,
          discount: item.discount,
          totalPrice: item.totalPrice
        },
        { transaction: t }
      );

      if (findProduct.isBatchExpireControl) {
        for (const _batch of item.batches) {
          const responseReadBatch = await readBatch(_batch.id, loginUser);
          if (responseReadBatch.error) {
            return responseReadBatch;
          }
          await models.PurchaseReturnItemBatch.create({
            purchaseReturnItemId: purchaseReturnItem.id,
            batchId: _batch.id,
            quantity: _batch.quantity
          }, { transaction: t })
          const batch = responseReadBatch.data
          if (batch.quantity < _batch.quantity * productUnit.exchangeValue) {
            throw Error(
              JSON.stringify({
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Sản phẩm (${findProduct.code}) không đủ số lượng tồn`,
              })
            );
          }
          await models.Batch.increment({
            quantity: -_batch.quantity * productUnit.exchangeValue
          }, {
            where: {
              id: _batch.id
            }, transaction: t
          })
        }
      }
      sumPrice += totalProductPrice;
    }
    if (purchaseReturn.paid && purchaseReturn.paid > sumPrice) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Số tiền trả cần nhỏ hơn hoặc bằng tổng số tiền thanh toán`,
        })
      );
    }

    if (
      purchaseReturn.paid &&
      purchaseReturn.totalPrice - purchaseReturn.paid !== purchaseReturn.debt
    ) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Số tiền cần trả và số tiền nợ phải bằng tổng số tiền thanh toán`,
        })
      );
    }

    // Update total price
    await models.PurchaseReturn.update(
      {
        totalPrice: sumPrice,
        discount: purchaseReturn.discount || 0,
        code: generatePurchaseReturnCode(newPurchaseReturn.id),
        ...(purchaseReturn.status && { status: purchaseReturn.status }),
      },
      {
        where: {
          id: newPurchaseReturn.id,
        },
        transaction: t,
      }
    );

    await models.UserLog.create({
      userId: newPurchaseReturn.createdBy,
      type: userLogContant.TYPE.PURCHASE_RETURN,
      amount: sumPrice,
      branchId: newPurchaseReturn.branchId,
      code: generatePurchaseReturnCode(newPurchaseReturn.id)
    }, { transaction: t })

    //Create transaction
    const typeTransaction = await transactionService.generateTypeTransactionPurchaseReturn(loginUser.storeId);
    const newTransaction = await models.Transaction.create({
      code: generatePurchaseReturnCode(newPurchaseReturn.id),
      paymentDate: new Date(),
      ballotType: transactionContant.BALLOTTYPE.INCOME,
      typeId: typeTransaction,
      value: newPurchaseReturn.paid,
      userId: newPurchaseReturn.userId,
      createdBy: loginUser.id,
      target: transactionContant.TARGET.SUPPLIER,
      targetId: newPurchaseReturn.supplierId,
      isDebt: true,
      branchId: newPurchaseReturn.branchId,
      isPaymentOrder: true
    }, {
      transaction: t
    });
    //End create transaction

    //Create Payment
    await models.Payment.create({
      isReturn: true,
      amount: newPurchaseReturn.paid,
      code: generatePurchaseReturnCode(newPurchaseReturn.id),
      createdBy: loginUser.id,
      paymentMethod: newPurchaseReturn.paymentType,
      status: 'SUCCEED',
      supplierId: newPurchaseReturn.supplierId,
      totalAmount: newPurchaseReturn.totalPrice,
      transactionId: newTransaction.id
    }, {
      transaction: t
    })
  })

  const { data: refreshPurchaseReturn } = await readPurchaseReturn(
    newPurchaseReturn.id,
    loginUser
  );

  if (refreshPurchaseReturn.status === purchaseReturnStatus.TRASH) {
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `Không thể tạo phiếu trả hàng`,
    };
  }



  return {
    success: true,
    data: refreshPurchaseReturn,
  };

}

export async function updatePurchaseReturnStatus(id, payload, loginUser) {
  const findPurchaseReturn = await models.PurchaseReturn.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findPurchaseReturn) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Phiếu trả hàng không tồn tại",
    };
  }

  await models.PurchaseReturn.update(
    {
      status: payload.status,
    },
    {
      where: {
        id,
      },
    }
  );

  // TODO::Xử lý case từ lưu tạm sang hoàn thành và ngược lại

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.purchase_return_update.value,
    data: { id, ...payload },
  });

  return {
    success: true,
  };
}

export async function indexDelete(id, loginUser) {
  const findPurchaseReturn = await models.PurchaseReturn.findByPk(id, {
    attributes: ["id"],
  });
  if (!findPurchaseReturn) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Không tìm thấy phiếu trả hàng",
    };
  }
  await models.PurchaseReturn.destroy({
    where: {
      id,
    },
  });
  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.purchase_return_delete.value,
    data: {
      id
    },
  });

  return {
    success: true,
  };
}