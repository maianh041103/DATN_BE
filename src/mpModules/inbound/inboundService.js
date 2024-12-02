import { createWarehouseCard } from "../warehouse/warehouseService";
import { warehouseStatus } from "../warehouse/constant";
import { addInventory, getInventory } from "../inventory/inventoryService";
import tripContant from "../trip/tripContant";

const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { readUser } = require("../user/userService");
const { readBranch } = require("../branch/branchService");
const { readSupplier } = require("../supplier/supplierService");
const { readBatch } = require("../batch/batchService");
const { readProductUnit } = require("../product/productUnitService");
const { inboundStatus } = require("../inbound/inboundConstant");
const { addFilterByDate } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");
const transactionContant = require("../transaction/transactionContant");
const transactionService = require("../transaction/transactionService");
const inboundPaymentService = require("./inboundPaymentService");
const userLogContant = require("../userLog/userLogContant");

const userAttributes = [
  "id",
  "username",
  "email",
  "fullName",
  "avatarId",
  "phone",
];

const userIncludes = [
  {
    model: models.Image,
    as: "avatar",
    attributes: ["id", "originalName", "fileName", "filePath", "path"],
  },
];

const inboundIncludes = [
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
    model:models.InboundToProduct,
    as:"inboundProducts",
    include:[
      {
        model:models.Product,
        as:"product",
        attributes: ["code","name","primePrice","baseUnit"]
      },
      {
        model:models.ProductUnit,
        as:"productUnit",
        attributes: ["unitName","code"]
      },
      {
        model:models.InboundProductBatch,
        as:"batches",
        include:[{
          model:models.Batch,
          as:"batch",
          attributes: ["name","expiryDate"]
        }]
      }
    ]
  }
];

const inboundAttributes = [
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
  [Sequelize.literal(`(SELECT COUNT(inbound_to_products.id) FROM inbound_to_products WHERE inbound_to_products.inboundId = Inbound.id
        AND inbound_to_products.deletedAt IS NULL)`), 'countProduct'],
  [Sequelize.literal(`(SELECT SUM(inbound_to_products.quantity) FROM inbound_to_products WHERE inbound_to_products.inboundId = Inbound.id
        AND inbound_to_products.deletedAt IS NULL)`), 'quantityProduct']
];

const productAttributes = ["name", "shortName", "code", "barCode", "imageId", "isBatchExpireControl"];

const inboundProductIncludes = [
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
    model: models.InboundProductBatch,
    as: "batches",
    attributes: [
      "id",
      "quantity",
    ],
    include: [
      {
        model: models.Batch,
        as: "batch",
        attributes: [
          "id",
          "name",
          "quantity",
          "expiryDate",
        ]
      }
    ]
  },
  {
    model: models.ProductUnit,
    as: "productUnit",
    attributes: ["id", "unitName", "exchangeValue", "price", "isBaseUnit"],
  },
];

export async function indexInbounds(params, loginUser) {
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
    attributes: inboundAttributes,
    offset: +limit * (+page - 1),
    include: inboundIncludes,
    limit: +limit,
    order: [["id", "DESC"]],
  };

  const where = {
    status: {
      [Op.ne]: inboundStatus.TRASH,
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
    where.code = code;
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
    models.Inbound.findAll(query),
    models.Inbound.count(query),
  ]);

  return {
    success: true,
    data: {
      items,
      totalItem,
    },
  };
}

export async function readInbound(id, loginUser) {
  const findInbound = await models.Inbound.findOne({
    include: inboundIncludes,
    attributes: inboundAttributes,
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findInbound) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Phiếu nhập hàng không tồn tại",
    };
  }

  const products = await models.InboundToProduct.findAll({
    attributes: ["id", "productId", "inboundId", "quantity", "productUnitId", "price", "discount"],
    include: inboundProductIncludes,
    where: {
      inboundId: id,
    },
  });

  return {
    success: true,
    data: {
      inbound: findInbound,
      products,
    },
  };
}

function generateInboundCode(no) {
  if (no <= 0) return "NSP000000000";
  if (no < 10) return `NSP00000000${no}`;
  if (no < 100) return `NSP0000000${no}`;
  if (no < 1000) return `NSP000000${no}`;
  if (no < 10000) return `NSP00000${no}`;
  if (no < 100000) return `NSP0000${no}`;
  if (no < 1000000) return `NSP000${no}`;
  if (no < 10000000) return `NSP00${no}`;
  if (no < 100000000) return `NSP0${no}`;
  if (no < 1000000000) return `NSP${no}`;
  return no;
}

export async function createInbound(inbound, loginUser) {
  try {
    return await handleCreateInbound(inbound, loginUser);
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

export async function handleCreateInbound(inbound, loginUser) {
  if (!inbound.products || !inbound.products.length) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Bạn cần chọn sản phẩm để tiến hành nhập hàng`,
    };
  }
  let itemQty = []
  // Validate thông tin nhà cung cấp, nhân viên, chi nhánh
  const [responseReadSupplier, responseReadUser, responseReadBranch] =
    await Promise.all([
      readSupplier(inbound.supplierId, loginUser),
      readUser(inbound.userId, loginUser),
      readBranch(inbound.branchId, loginUser),
    ]);
  if (responseReadSupplier.error) {
    return responseReadSupplier;
  }
  const supplier = responseReadSupplier.data
  if (responseReadUser.error) {
    return responseReadUser;
  }
  if (responseReadBranch.error) {
    return responseReadBranch;
  }
  // Validate thông tin sản phẩm, lô
  for (const item of inbound.products) {
    const productExist = await models.Product.findOne({
      where: {
        id: item.productId,
        storeId: loginUser.storeId,
      },
    });
    if (!productExist) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Sản phẩm có id = ${item.productId} không tồn tại`,
      };
    }
    item.product = productExist
    const responseReadProductUnit = await readProductUnit(item.productUnitId, loginUser)
    if (responseReadProductUnit.error) {
      return responseReadProductUnit;
    }
    item.productUnit = responseReadProductUnit.data
    for (const batch of item.batches) {
      const responseReadBatch = await readBatch(batch.id, loginUser);
      if (responseReadBatch.error) {
        return responseReadBatch;
      }
      batch.batch = responseReadBatch.data
    }
  }

  let newInbound;
  // Tạo nháp phiếu nhập hàng
  await models.sequelize.transaction(async (t) => {
    // Tạo nháp phiếu nhập hàng
    newInbound = await models.Inbound.create(
      {
        userId: inbound.userId,
        supplierId: inbound.supplierId,
        totalPrice: inbound.totalPrice || 0,
        discount: inbound.discount || 0,
        debt: inbound.debt || 0,
        paid: inbound.paid || 0,
        status: inboundStatus.SUCCEED,
        description: inbound.description,
        storeId: loginUser.storeId,
        branchId: inbound.branchId,
        createdBy: loginUser.id
      },
      { transaction: t }
    );
    let sumPrice = 0;
    for (const item of inbound.products) {
      // Tiền sản phẩm = Giá nhập * Số lượng - Giảm giá
      const totalProductPrice =
        item.importPrice * item.totalQuantity - (item.discount || 0);
      if (totalProductPrice !== item.totalPrice) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Sản phẩm (${item.productId}) có mã ${item.product.code} sai thông tin về số lượng, đơn giá, giảm giá và thành tiền`,
          })
        );
      }
      const newInboundProduct = await models.InboundToProduct.create(
        {
          storeId: loginUser.storeId,
          branchId: inbound.branchId,
          inboundId: newInbound.id,
          quantity: item.totalQuantity,
          price: item.importPrice,
          discount: item.discount,
          productUnitId: item.productUnitId,
          productId: item.productId,
          createdBy: newInbound.createdBy,
        },
        { transaction: t }
      );
      let totalProductQuantity = 0;

      if (item.product.isBatchExpireControl) {
        for (const batch of item.batches) {
          const responseReadBatch = await readBatch(batch.id, loginUser);
          if (responseReadBatch.error) {
            return responseReadBatch;
          }
          totalProductQuantity += batch.quantity;
          const _batch = responseReadBatch.data;
          await models.Batch.increment({
            quantity: item.productUnit.exchangeValue * batch.quantity,
            oldQuantity: item.productUnit.exchangeValue * batch.quantity
          },
            {
              where: { id: _batch.id },
              transaction: t
            })
          await models.InboundProductBatch.create({
            inboundProductId: newInboundProduct.id,
            batchId: _batch.id,
            quantity: batch.quantity,
          }, { transaction: t });
        }

        if (totalProductQuantity !== item.totalQuantity) {
          throw Error(
            JSON.stringify({
              error: true,
              code: HttpStatusCode.BAD_REQUEST,
              message: `Sản phẩm có mã ${item.product.code} có tổng ${totalProductQuantity} sản phẩm trong lô không bằng tổng sổ lượng sản phẩm đã nhập (${item.totalQuantity})`,
            })
          );
        }
      }
      else {
        // Đối với sản phẩm (hàng hóa) không có lô
        await models.ProductBatchHistory.create(
          {
            storeId: loginUser.storeId,
            branchId: inbound.branchId,
            productId: item.productId,
            batchId: null,
            productUnitId: item.productUnitId,
            expiryDate: null,
            createdBy: loginUser.id,

            importPrice: item.importPrice,
            totalPrice: item.totalPrice,
            discount: item.discount,

            inboundProductId: newInboundProduct.id,
            quantity: item.totalQuantity,
            initQuantity: item.totalQuantity,
          },
          { transaction: t }
        );
      }

      sumPrice += totalProductPrice;
    }

    // Validate Tổng tiền = Tổng tiền tất cả sản phẩm + Tiền được chiết khấu
    if (inbound.totalPrice + (inbound.discount || 0) !== sumPrice) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Số tiền tổng thanh toán không hợp lệ`,
        })
      );
    }

    if (inbound.paid && inbound.paid > sumPrice) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Số tiền trả cần nhỏ hơn hoặc bằng tổng số tiền thanh toán`,
        })
      );
    }

    if (inbound.paid && inbound.totalPrice - inbound.paid !== inbound.debt) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Số tiền cần trả và số tiền nợ phải bằng tổng số tiền thanh toán`,
        })
      );
    }

    // Update total price
    await models.Inbound.update(
      {
        totalPrice: sumPrice,
        discount: inbound.discount || 0,
        code: generateInboundCode(newInbound.id),
        ...(inbound.status && { status: inbound.status }),
      },
      {
        where: {
          id: newInbound.id,
        },
        transaction: t,
      }
    );

    await models.UserLog.create({
      userId: newInbound.createdBy,
      type: userLogContant.TYPE.INBOUND,
      amount: sumPrice,
      branchId: newInbound.branchId,
      code: generateInboundCode(newInbound.id)
    }, { transaction: t })

    //Create transaction
    const typeTransaction = await transactionService.generateTypeTransactionInbound(loginUser.storeId, t);
    const newTransaction = await models.Transaction.create({
      code: generateInboundCode(newInbound.id),
      paymentDate: new Date(),
      ballotType: transactionContant.BALLOTTYPE.EXPENSES,
      typeId: typeTransaction,
      value: newInbound.paid,
      userId: newInbound.userId,
      createdBy: loginUser.id,
      target: transactionContant.TARGET.SUPPLIER,
      targetId: newInbound.supplierId,
      isDebt: true,
      branchId: newInbound.branchId,
      isPaymentOrder: true
    }, {
      transaction: t
    });
    //End transaction
    newInbound.transactionId = newTransaction.id;
    await inboundPaymentService.createInboundPayment(newInbound, t);

    if (inbound.status === inboundStatus.SUCCEED) {
      for (const item of inbound.products) {
        const productUnit = await models.ProductUnit.findOne({
          attributes: ["exchangeValue"],
          where: {
            id: item.productUnitId
          }
        })
        if (!productUnit) {
          throw Error(
            JSON.stringify({
              error: true,
              code: HttpStatusCode.BAD_REQUEST,
              message: `Không tìm thấy đơn vị thuốc`,
            })
          );
        }
        await createWarehouseCard({
          code: generateInboundCode(newInbound.id),
          type: warehouseStatus.INBOUND,
          partner: supplier.name,
          productId: item.productId,
          branchId: inbound.branchId,
          changeQty: item.totalQuantity * productUnit.exchangeValue,
          remainQty: parseInt(await getInventory(inbound.branchId, item.productId)) + parseInt(+item.totalQuantity * +productUnit.exchangeValue),
          createdAt: new Date(),
          updatedAt: new Date()
        }, t)
        await addInventory(inbound.branchId, item.productId, item.totalQuantity * productUnit.exchangeValue, t)
      }
    }
  });
  const { data: refreshInbound } = await readInbound(newInbound.id, loginUser);

  if (refreshInbound.status === inboundStatus.TRASH) {
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `Không thể tạo phiếu nhập hàng`,
    };
  }

  return {
    success: true,
    data: refreshInbound,
  };
}

export async function updateInboundStatus(id, payload, loginUser) {
  const findInbound = await models.Inbound.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findInbound) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Phiếu nhập hàng không tồn tại",
    };
  }

  await models.Inbound.update(
    {
      status: payload.status,
    },
    {
      where: {
        id,
      },
    }
  );

  // Xử lý case từ lưu tạm sang hoàn thành và ngược lại

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.inbound_update.value,
    data: { id, ...payload },
  });
  return {
    success: true,
  };
}

export async function deleteInbound(id, loginUser) {
  const inbound = await models.Inbound.findByPk(id, {
    attributes: ["id"],
  });
  if (!inbound) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Không tìm thấy nhập sản phẩm",
    };
  }
  await models.Inbound.destroy({
    where: {
      id,
    },
  });
  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.inbound_delete.value,
    data: {
      id
    },
  });
  return {
    success: true,
  };
}
