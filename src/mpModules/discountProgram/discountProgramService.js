const moment = require("moment");
const { getProductDetail } = require("../product/productService");
const { getCustomer, customerFilter } = require("../customer/customerService");
const { isValidNotIntersectTime } = require("../../helpers/utils");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

const discountProgramIncludes = [
  {
    model: models.Customer,
    as: "percentDiscountToCustomer",
    attributes: ["id", "username", "phone"],
  },
  {
    model: models.Product,
    as: "percentDiscountToProduct",
    attributes: ["id", "name", "code", "cost"],
  },
];

const discountProgramAttributes = [
  "id",
  "customerId",
  "productId",
  "percentDiscount",
  "startTime",
  "endTime",
];

async function queryFilter(params) {
  const {
    include,
    attributes = discountProgramAttributes,
    productId,
    createdBy,
    customerId,
    notDiscountProgramId,
    limit,
    page,
    groupCustomerIds,
    keyword,
    order = [["id", "DESC"]],
  } = params;

  let { dateRange = {} } = params;
  try {
    dateRange = JSON.parse(dateRange);
  } catch (e) {
    dateRange = {};
  }

  const conditions = { deletedAt: null };

  if (productId || _.isArray(productId)) {
    conditions.productId = productId;
  }

  if (createdBy) {
    conditions.createdBy = createdBy;
  }

  if (customerId) {
    conditions.customerId = customerId;
  }

  if ((_.isArray(groupCustomerIds) && groupCustomerIds.length) || keyword) {
    const customers = await customerFilter({ groupCustomerIds, keyword });
    if (customers.length) conditions.customerId = customers.map((o) => o.id);
  }

  if (notDiscountProgramId) {
    conditions.id = {
      [Op.ne]: notDiscountProgramId,
    };
  }

  const { startDate, endDate } = dateRange;

  if (startDate && moment(startDate).isValid()) {
    conditions.startTime = {
      [Op.gte]: moment(startDate).format("YYYY-MM-DD 00:00:00"),
    };
  }

  if (endDate && moment(endDate).isValid()) {
    conditions.endTime = {
      [Op.lte]: moment(endDate).format("YYYY-MM-DD 23:59:59"),
    };
  }

  const query = { raw: true };

  if (_.isArray(attributes) && attributes.length) {
    query.attributes = attributes;
  }

  if (_.isArray(include) && include.length) {
    query.include = include;
  }

  if (page && limit) {
    query.limit = +limit;
    query.offset = +limit * (+page - 1);
  }

  query.where = conditions;

  if (_.isArray(order) && order.length) {
    query.order = order;
  }

  return query;
}

export async function discountProgramFilter(params) {
  try {
    return await models.ProductToCustomerPercentDiscount.findAll(
      await queryFilter(params)
    );
  } catch (e) {
    return [];
  }
}

export async function fetchDiscountProgramList(params) {
  try {
    const { rows, count } =
      await models.ProductToCustomerPercentDiscount.findAndCountAll(
        await queryFilter({
          ...params,
          include: discountProgramIncludes,
        })
      );
    return {
      success: true,
      data: {
        list_discount_program: rows,
        totalItem: count,
      },
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

async function validateDataDiscountProgram(data) {
  try {
    const { listCustomer = [] } = data;

    if (!listCustomer.length) {
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: `Chưa chọn khách hàng`,
      };
    }

    // Kiểm tra dữ liệu
    for (let customerId of listCustomer) {
      const customerInfo = (await getCustomer(customerId)) || {};
      if (!_.isEmpty(customerInfo)) continue;
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: `Mã khách hàng ${customerId} không tồn tại`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function createDiscountProgram(params) {
  try {
    const format = "YYYY-MM-DD HH:mm:ss";

    // Kiểm tra thời gian có hợp lệ hay không ?
    if (
      !params.startTime ||
      !params.endTime ||
      !moment(params.startTime, format, true).isValid() ||
      !moment(params.endTime, format, true).isValid() ||
      moment(moment(params.startTime)).isAfter(moment(params.endTime))
    ) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Thời gian bắt đầu và kết thúc không hợp lệ`,
      };
    }

    const resProduct = await getProductDetail(params.productId);

    if (!(resProduct && resProduct.success) || !resProduct.data) {
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: `Sản phẩm không tồn tại`,
      };
    }

    const res = await validateDataDiscountProgram(params);
    if (res.error) return res;

    const { listCustomer } = params;

    let bulkCreateRecord = [];
    for (let customerId of listCustomer) {
      const programs = await discountProgramFilter({
        productId: params.productId,
        customerId: customerId,
      });

      // Kiểm tra xem các phần tử trong mảng có vi phạm về thời gian đối với chương trình sẽ tạo ra hay không?
      let checkStartEndTime = false,
        notValidDiscountProgram = {};
      for (let item of programs) {
        if (
          !isValidNotIntersectTime({
            format,
            startTime: item.startTime,
            endTime: item.endTime,
            newStartTime: params.startTime,
            newEndTime: params.endTime,
          })
        ) {
          checkStartEndTime = true;
          notValidDiscountProgram = item;
          break;
        }
      }

      if (checkStartEndTime) {
        const customerInfo =
          (await getCustomer(notValidDiscountProgram.customerId)) || {};
        return {
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Xung đột hoặc trùng với cấu hình đã thiết lập: Khách hàng: Mã ${customerInfo.id} - ${customerInfo.username} Sản phẩm: Mã ${params.productId} - ${resProduct.data.name} Bắt đầu: ${notValidDiscountProgram.startTime} Kết thúc: ${notValidDiscountProgram.endTime}`,
        };
      }

      bulkCreateRecord.push({
        productId: params.productId,
        customerId,
        startTime: params.startTime,
        endTime: params.endTime,
        percentDiscount: params.percentDiscount,
        createdBy: params.createdBy,
        createdAt: params.createdAt,
      });
    }

    await models.ProductToCustomerPercentDiscount.bulkCreate(bulkCreateRecord);

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

// update one discount program
export async function updateDiscountProgram(id, params) {
  try {
    // check item exist?
    const foundDiscountProgram =
      await models.ProductToCustomerPercentDiscount.findOne({
        attributes: ["id"],
        where: {
          id,
          deletedAt: null,
        },
      });

    if (!foundDiscountProgram) {
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: "Chương trình chiết khấu không tồn tại",
      };
    }

    const format = "YYYY-MM-DD HH:mm:ss";

    // Kiểm tra thời gian có hợp lệ hay không ?
    if (
      !params.startTime ||
      !params.endTime ||
      !moment(params.startTime, format, true).isValid() ||
      !moment(params.endTime, format, true).isValid() ||
      moment(moment(params.startTime)).isAfter(moment(params.endTime))
    ) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Thời gian bắt đầu và kết thúc không hợp lệ`,
      };
    }

    // Không thể tồn tại nhiều hơn 1 bản ghi của quản lý lưu giá trị chiết khấu về 1 sản phẩm & trùng thời gian
    const resProduct = await getProductDetail(params.productId);

    if (!(resProduct && resProduct.success) || !resProduct.data) {
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: `Sản phẩm không tồn tại`,
      };
    }

    const res = await validateDataDiscountProgram(params);
    if (res.error) return res;

    const { listCustomer } = params;
    for (let customerId of listCustomer) {
      const programs = await discountProgramFilter({
        productId: params.productId,
        customerId: customerId,
        notDiscountProgramId: id,
      });

      // Kiểm tra xem các phần tử trong mảng có vi phạm về thời gian đối với chương trình sẽ cập nhật hay không?
      let checkStartEndTime = false,
        notValidDiscountProgram = {};
      for (let item of programs) {
        if (
          !isValidNotIntersectTime({
            format,
            startTime: item.startTime,
            endTime: item.endTime,
            newStartTime: params.startTime,
            newEndTime: params.endTime,
          })
        ) {
          checkStartEndTime = true;
          notValidDiscountProgram = item;
          break;
        }
      }

      if (checkStartEndTime) {
        const customerInfo =
          (await getCustomer(notValidDiscountProgram.customerId)) || {};
        return {
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Xung đột hoặc trùng với cấu hình đã thiết lập: Khách hàng: Mã ${customerInfo.id} - ${customerInfo.username} Sản phẩm: Mã ${params.productId} - ${resProduct.data.name} Bắt đầu: ${notValidDiscountProgram.startTime} Kết thúc: ${notValidDiscountProgram.endTime}`,
        };
      }
    }

    await models.ProductToCustomerPercentDiscount.update(
      {
        productId: params.productId,
        startTime: params.startTime,
        endTime: params.endTime,
        percentDiscount: params.percentDiscount,
        updatedBy: params.updatedBy,
        updatedAt: params.updatedAt,
      },
      {
        where: {
          id,
          customerId: listCustomer,
        },
      }
    );

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function getDiscountProgramDetail(id) {
  try {
    // check item exist?
    const instance = await models.ProductToCustomerPercentDiscount.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!instance) {
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: "Chương trình chiết khấu không tồn tại",
      };
    }

    return {
      success: true,
      data: instance,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function deleteDiscountProgramById(id, loginUser) {
  try {
    // check item exist?
    const checkExist = await models.ProductToCustomerPercentDiscount.findOne({
      attributes: ["id"],
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!checkExist) {
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: "Chương trình chiết khấu không tồn tại",
      };
    }

    await models.ProductToCustomerPercentDiscount.update(
      { deletedAt: new Date() },
      {
        where: {
          id,
        },
      }
    );

    return {
      success: true,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}
