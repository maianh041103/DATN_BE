const moment = require("moment");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");

export async function promotionProgramToCustomerFilter(params) {
  const { customerId, time, raw } = params;
  const conditions = {};
  if (customerId) conditions.customerId = customerId;
  const query = {
    where: conditions,
    raw: true,
  };
  if (typeof raw !== "undefined") {
    query.raw = raw;
  }
  if (time) {
    query.include = [
      {
        model: models.PromotionProgram,
        as: "promotion_to_customer",
        include: [
          {
            model: models.Image,
            as: "image",
            attributes: ["id", "originalName", "fileName", "filePath", "path"],
          },
        ],
        where: {
          startTime: {
            [Op.lte]: moment(time).format("YYYY-MM-DD HH:mm:ss"),
          },
          endTime: {
            [Op.gte]: moment(time).format("YYYY-MM-DD HH:mm:ss"),
          },
          deletedAt: null,
        },
      },
    ];
  }
  try {
    return await models.PromotionToCustomer.findAll(query);
  } catch (e) {
    return [];
  }
}
