import {insertNewCode} from "../product/productCodeService";
import {createDefaultCustomer} from "../customer/customerService";

const { createUserTracking } = require("../behavior/behaviorService");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { accountTypes, logActions, ACTIVE } = require("../../helpers/choices");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const storeService = require("../marketSell/marketSellService");
const attributes = [
  "id",
  "name",
  "phone",
  "email",
  "provinceId",
  "districtId",
  "wardId",
  "logoId",
  "address",
  "createdAt",
  "businessRegistrationNumber",
    "isAgency"
];

const include = [
  {
    model: models.Image,
    as: "businessRegistrationImage"
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
  {
    model: models.Image,
    as: "logo"
  }
];

function processQuery(params) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    provinceId,
    districtId,
    wardId,
    storeId,
    status,
  } = params;
  const query = {
    attributes,
    include,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["createdAt", "DESC"]],
  };
  const where = {};
  if (keyword) {
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      phone: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      email: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      field: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  if (storeId) {
    where.id = storeId;
  }
  if (provinceId) {
    where.provinceId = provinceId;
  }
  if (districtId) {
    where.districtId = districtId;
  }
  if (wardId) {
    where.wardId = wardId;
  }
  if (typeof status !== "undefined") {
    where.status = status;
  }
  query.where = where;
  return query;
}

export async function storeFilter(params) {
  try {
    return await models.Store.findAll(processQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexStores(params) {
  const { rows, count } = await models.Store.findAndCountAll(
      processQuery(params)
  );
  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,
    },
  };
}
export async function listStore(params) {
  let page = parseInt(params.page, 10) || 1;
  let limit = parseInt(params.limit, 10) || 10;
  const offset = (page - 1) * limit;
  // Thực hiện truy vấn với phân trang
  const { count, rows } = await models.Store.findAndCountAll({
    offset,
    include:StoreInclude,
    limit,
    order: [['createdAt', 'DESC']]
  });

  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,

      totalPages: Math.ceil(count / limit),
      currentPage: page
    },
  };
}

const StoreInclude = [
  {
    model: models.Ward,
    as: "ward",
    attributes: ["name"],
  },
  {
    model: models.Province,
    as: "province",
    attributes: ["name"],
  },
  {
    model: models.District,
    as: "district",
    attributes: ["name"],
  },
  {
    model: models.Image,
    as: "businessRegistrationImage"
  },
  {
    model: models.User,
    as: "users",
    attributes: ["id", "username", "email", "phone", "position"],
  },
  {
    model: models.Branch,
    as: "branches"
  },
  {
    model:models.Image,
    as:"logo"
  }
];


export async function createStore(payload) {
  const newStore = await models.Store.create(payload);
  await insertNewCode(newStore.id);
  const createBranchInput = {
    name: payload.name,
    phone: payload.phone,
    code: "",
    zipCode: "",
    wardId: payload.wardId || null,
    districtId: payload.districtId || null,
    provinceId: payload.provinceId || null,
    address1: payload.address || "",
    address2: "",
    isDefaultBranch: true,
    createdBy: payload.createdBy,
    createdAt: new Date(),
    storeId: newStore.id,
  };
  await createDefaultCustomer(newStore.id);
  await storeService.createAddressService({
    phone: payload.phone,
    wardId: payload.wardId || null,
    districtId: payload.districtId || null,
    provinceId: payload.provinceId || null,
    address: payload.address || "",
    storeId: newStore.id,
    isDefaultAddress: true,
    fullName: payload.name
  });
  const newBranch = await models.Branch.create(createBranchInput);

  const logObject = {
    accountId: newStore.createdBy,
    type: accountTypes.USER,
  };

  [
    {
      ...logObject,
      objectId: newStore.id,
      action: logActions.store_create.value,
      data: payload,
    },
    {
      ...logObject,
      objectId: newBranch.id,
      action: logActions.branch_create.value,
      data: createBranchInput,
    },
  ].forEach((obj) => createUserTracking(obj));

  return {
    success: true,
    data: newStore,
  };
}

export async function updateStore(id, payload, loginUser) {
  if (loginUser.storeId != id) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Store không tồn tại",
    };
  }

  const findStore = await models.Store.findByPk(id, {
    attributes: ["id"],
  });

  if (!findStore) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Store không tồn tại",
    };
  }

  const t = await models.sequelize.transaction(async (t)=>{
    if(payload.name !== findStore.name){
      await models.Customer.update({
        fullName: payload.name
      },{
        where:{
          customerStoreId:id
        },
        transaction:t
      })
    }

    await models.Store.update(payload, {
      where: {
        id,
      },
      transaction:t
    });
  });

  createUserTracking({
    accountId: payload.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.store_update.value,
    data: payload,
  });

  return {
    success: true,
  };
}

export async function isExistStore(id) {
  return !!(await models.Store.findOne({ where: { id } }, { status: ACTIVE }));
}

export async function countStore(query) {
  try {
    delete query.order;
    delete query.include;
    query.attributes = ["id"];
    query.raw = true;
    return await models.Store.count(query);
  } catch (e) {
    return 0;
  }
}

export async function readStore(id, loginUser) {
  if (loginUser.storeId != id) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Cửa hàng có không tồn tại",
    };
  }
  const findStore = await models.Store.findByPk(id, {
    attributes,
    include,
  });
  if (!findStore) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Cửa hàng có không tồn tại",
    };
  }
  return {
    success: true,
    data: findStore,
  };
}

// export async function deleteStore(id, userId) {
//   const instance = await models.Store.findByPk(id, {
//     attributes: ["id", "name"],
//   });

//   if (!instance) {
//     return {
//       error: true,
//       code: HttpStatusCode.NOT_FOUND,
//       message: "Store không tồn tại",
//     };
//   }

//   await models.Store.destroy({
//     where: {
//       id,
//     },
//   });

//   createUserTracking({
//     accountId: userId,
//     type: accountTypes.USER,
//     objectId: instance.id,
//     action: logActions.store_delete.value,
//     data: { id, name: instance.name },
//   });

//   return {
//     success: true,
//   };
// }
