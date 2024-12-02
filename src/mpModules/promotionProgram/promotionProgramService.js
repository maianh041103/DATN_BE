const moment = require("moment");
const { checkUniqueValue } = require("../../helpers/utils");
const { getCustomer } = require("../customer/customerService");
const {
  promotionProgramToCustomerFilter,
} = require("./promotionToCustomerService");
const {
  promotionProgramToProductFilter,
} = require("./promotionToProductService ");
const { createUserTracking } = require("../behavior/behaviorService");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const {
  ERROR_CODE_ITEM_NOT_EXIST,
  ERROR_CODE_INVALID_PARAMETER,
} = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");

async function processQuery(params) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    slug,
    listCustomer,
    listProduct,
    include = [
      {
        model: models.Image,
        as: "image",
        attributes: ["id", "originalName", "fileName", "filePath", "path"],
      },
    ],
  } = params;

  const query = {
    include,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
  };

  const where = { deletedAt: null };

  if (keyword) {
    where[Op.or] = {
      title: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      description: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }

  if (slug) where.slug = slug;

  let { dateRange = {} } = params;
  try {
    dateRange = JSON.parse(dateRange);
  } catch (e) {
    dateRange = {};
  }

  const { startDate, endDate } = dateRange;

  if (startDate && moment(startDate).isValid()) {
    where.startTime = {
      [Op.gte]: moment(startDate).format("YYYY-MM-DD 00:00:00"),
    };
  }

  if (endDate && moment(endDate).isValid()) {
    where.endTime = {
      [Op.lte]: moment(endDate).format("YYYY-MM-DD 23:59:59"),
    };
  }

  let listPromotion = [],
    promotionProducts = [],
    promotionCustomers = [],
    isProductFilter = false,
    isCustomerFilter = false;

  if (_.isArray(listCustomer) && listCustomer.length) {
    let items = await promotionProgramToCustomerFilter({
      customerId: listCustomer,
    });
    for (let item of items) {
      promotionCustomers.push(item.promotionId);
    }
    isCustomerFilter = true;
  }

  if (_.isArray(listProduct) && listProduct.length) {
    let items = await promotionProgramToProductFilter({
      productId: listProduct,
    });
    for (let item of items) {
      promotionProducts.push(item.promotionId);
    }
    isProductFilter = true;
  }

  if (isCustomerFilter && isProductFilter) {
    if (!promotionCustomers.length || !promotionProducts.length) {
      where.id = listPromotion;
    } else {
      listPromotion = _.intersection(promotionCustomers, promotionProducts);
      where.id = [...new Set(listPromotion)];
    }
  } else if (isCustomerFilter) {
    where.id = [...new Set(promotionCustomers)];
  } else if (isProductFilter) {
    where.id = [...new Set(promotionProducts)];
  }

  query.where = where;

  return query;
}

export async function fetchPromotionProgramList(params) {
  const { rows, count } = await models.PromotionProgram.findAndCountAll(
    await processQuery(params)
  );
  return {
    success: true,
    data: {
      list_promotion_program: rows,
      totalItem: count,
    },
  };
}

export async function createPromotionProgram(params) {
  const { program, listCustomer, groupProduct } = params;
  const checkExistSlug = await checkUniqueValue("PromotionProgram", {
    slug: program.slug,
    deletedAt: null,
  });

  if (!checkExistSlug) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Slug ${program.slug} đã tồn tại, xin hãy chọn slug khác.`,
    };
  }

  const format = "YYYY-MM-DD HH:mm:ss";
  if (
    !program.startTime ||
    !program.endTime ||
    !moment(program.startTime, format, true).isValid() ||
    !moment(program.endTime, format, true).isValid() ||
    moment(moment(program.startTime)).isAfter(moment(program.endTime))
  ) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Thời gian bắt đầu và kết thúc chương trình khuyến mại không hợp lệ`,
    };
  }

  if (!_.isArray(listCustomer) || !_.isArray(groupProduct)) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Danh sách khách hàng hoặc danh sách sản phẩm không hợp lệ`,
    };
  }

  const createPromotion = await models.PromotionProgram.create(program);

  createUserTracking({
    accountId: createPromotion.createdBy,
    type: accountTypes.USER,
    objectId: createPromotion.id,
    action: logActions.promotion_program_create.value,
    data: { ...params },
  });

  let bulkPromotionToCustomers = [];
  for (let customerId of listCustomer) {
    const customerInfo = (await getCustomer(customerId)) || {};
    if (!_.isEmpty(customerInfo)) {
      bulkPromotionToCustomers.push({
        customerId: customerId,
        promotionId: createPromotion.id,
        createdBy: createPromotion.createdBy,
        createdAt: new Date(),
      });
      continue;
    }
    return {
      error: true,
      code: ERROR_CODE_ITEM_NOT_EXIST,
      message: `Mã khách hàng ${customerId} không tồn tại`,
    };
  }
  await models.PromotionToCustomer.bulkCreate(bulkPromotionToCustomers);

  let bulkPromotionToProducts = [];
  for (let productId of groupProduct) {
    bulkPromotionToProducts.push({
      productId: productId,
      promotionId: createPromotion.id,
      createdBy: createPromotion.createdBy,
      createdAt: new Date(),
    });
  }
  await models.PromotionToProduct.bulkCreate(bulkPromotionToProducts);

  return {
    success: true,
    data: createPromotion,
  };
}

export async function updatePromotionProgram(id, params) {
  const { program, listCustomer, groupProduct } = params;
  const foundPromotionProgram = await models.PromotionProgram.findOne({
    attributes: ["id"],
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!foundPromotionProgram) {
    return {
      error: true,
      code: ERROR_CODE_ITEM_NOT_EXIST,
      message: "Chương trình khuyến mại không tồn tại",
    };
  }

  // check slug is unique?
  const checkExistSlug = await checkUniqueValue("PromotionProgram", {
    slug: program.slug,
    id: { [Op.ne]: id },
    deletedAt: null,
  });

  if (!checkExistSlug) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Slug ${program.slug} đã tồn tại, xin hãy chọn slug khác.`,
    };
  }

  const format = "YYYY-MM-DD HH:mm:ss";
  // Kiểm tra thời gian có hợp lệ hay không ?
  if (
    !program.startTime ||
    !program.endTime ||
    !moment(program.startTime, format, true).isValid() ||
    !moment(program.endTime, format, true).isValid() ||
    moment(moment(program.startTime)).isAfter(moment(program.endTime))
  ) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Thời gian bắt đầu và kết thúc chương trình khuyến mại không hợp lệ`,
    };
  }

  const updatePromotion = await models.PromotionProgram.update(program, {
    where: { id },
  });

  createUserTracking({
    accountId: program.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.promotion_program_update.value,
    data: { id, ...params },
  });

  let bulkPromotionToCustomers = [];
  for (let customerId of listCustomer) {
    // Kiểm tra dữ liệu
    const customerInfo = (await getCustomer(customerId)) || {};
    if (!_.isEmpty(customerInfo)) {
      bulkPromotionToCustomers.push({
        customerId: customerId,
        promotionId: id,
        createdBy: program.createdBy,
        createdAt: new Date(),
      });
      continue;
    }
    return {
      error: true,
      code: ERROR_CODE_ITEM_NOT_EXIST,
      message: `Mã khách hàng ${customerId} không tồn tại`,
    };
  }
  await models.PromotionToCustomer.destroy({
    where: {
      promotionId: id,
    },
  });
  await models.PromotionToCustomer.bulkCreate(bulkPromotionToCustomers);

  let bulkPromotionToProducts = [];
  for (let productId of groupProduct) {
    bulkPromotionToProducts.push({
      productId: productId,
      promotionId: id,
      createdBy: updatePromotion.createdBy,
      createdAt: new Date(),
    });
  }
  await models.PromotionToProduct.destroy({
    where: {
      promotionId: id,
    },
  });
  await models.PromotionToProduct.bulkCreate(bulkPromotionToProducts);

  return {
    success: true,
  };
}

export async function getPromotionProgramDetail(id) {
  const instance = await models.PromotionProgram.findOne({
    include: [
      {
        model: models.Image,
        as: "image",
        attributes: ["id", "originalName", "fileName", "filePath", "path"],
      },
      {
        model: models.Product,
        as: "products",
        through: {
          attributes: [],
          where: {
            promotionId: id,
          },
        },
        attributes: ["id", "name"],
      },
      {
        model: models.Customer,
        as: "customers",
        through: {
          attributes: [],
          where: {
            promotionId: id,
          },
        },
        attributes: ["id", "username", "phone"],
      },
    ],
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!instance) {
    return {
      error: true,
      code: ERROR_CODE_ITEM_NOT_EXIST,
      message: "Chương trình khuyến mại không tồn tại",
    };
  }

  return {
    success: true,
    data: instance,
  };
}

export async function deletePromotionProgramById(id, loginUser) {
  // check item exist?
  const checkExist = await models.PromotionProgram.findOne({
    attributes: ["id", "title"],
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!checkExist) {
    return {
      error: true,
      code: ERROR_CODE_ITEM_NOT_EXIST,
      message: "Chương trình khuyến mại không tồn tại",
    };
  }

  await models.PromotionProgram.update(
    { deletedAt: new Date() },
    {
      where: {
        id,
      },
    }
  );

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: checkExist.id,
    action: logActions.promotion_program_delete.value,
    data: { id, title: checkExist.title },
  });

  return {
    success: true,
  };
}
