const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = [
  "id",
  "username",
  "code",
  "note",
  "status",
  "isAutoHandle",
  "storeId",
  "branchId",
  "createdAt",
  "updatedAt",
];

const userIncludes = [
  {
    model: models.Image,
    as: "avatar",
    attributes: ["id", "originalName", "fileName", "filePath", "path"],
  },
];

const userAttributes = [
  "id",
  "username",
  "email",
  "fullName",
  "avatarId",
  "phone",
];

const npsIncludes = [
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
    include: [
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
    include: [
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
    model: models.User,
    as: "updater",
    attributes: userAttributes,
    include: userIncludes,
  },
];

function processBuildQuery(params) {
  const { page = 1, limit = 10, keyword = "", storeId, branchId } = params;
  const query = {
    attributes,
    include: npsIncludes,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
  };
  const where = {};
  if (keyword) {
    where[Op.or] = {
      username: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  if (storeId) where.storeId = storeId;
  if (branchId) where.branchId = branchId;
  query.where = where;
  return query;
}

export async function indexNps(params) {
  const { rows, count } = await models.Nps.findAndCountAll(
    processBuildQuery(params)
  );
  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,
    },
  };
}

export async function createNps(payload, loginUser) {
  const findNps = await models.Nps.findOne({
    where: {
      storeId: payload.storeId,
      branchId: payload.branchId,
    },
  });

  const behavior = {
    accountId: payload.createdBy,
    type: accountTypes.USER,
    objectId: payload.id,
  };
  if (findNps) {
    await models.Nps.update(payload, {
      where: {
        id: findNps.id,
      },
    });
    createUserTracking({
      ...behavior,
      data: { id: findNps.id, ...payload },
    });
  } else {
    await models.Nps.create(payload);
    createUserTracking({
      ...behavior,
      action: logActions.nps_create.value,
      data: payload,
    });
  }
  return {
    success: true,
  };
}

export async function updateNps(id, payload, loginUser) {
  const findNps = await models.Nps.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
      ...(loginUser.branchId && { branchId: loginUser.branchId }),
    },
  });

  if (!findNps) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Thông tin kết nối dược quốc gia không tồn tại",
    };
  }

  await models.Nps.update(payload, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.nps_update.value,
    data: { id, ...payload },
  });

  return {
    success: true,
  };
}

export async function readNps(id, loginUser) {
  const findNps = await models.Nps.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
      ...(loginUser.branchId && { branchId: loginUser.branchId }),
    },
  });
  if (!findNps) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Thông tin kết nối dược quốc gia không tồn tại`,
    };
  }
  return {
    success: true,
    data: findNps,
  };
}

export async function deleteNps(id, loginUser) {
  const findNps = await models.Nps.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
      ...(loginUser.branchId && { branchId: loginUser.branchId }),
    },
  });
  if (!findNps) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Thông tin kết nối dược quốc gia không tồn tại",
    };
  }

  await models.Nps.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.nps_delete.value,
    data: {
      id,
      username: findNps.username,
      storeId: findNps.storeId,
      branchId: findNps.branchId,
    },
  });

  return {
    success: true,
  };
}
