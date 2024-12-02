const { convertToSlug } = require("../../helpers/utils");
const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function fetchProductCategoryList(filter) {
  const { keyword = "", page = 1, limit = 10 } = filter;
  const conditions = { deletedAt: null };

  if (keyword) {
    conditions[Op.or] = [
      {
        name: {
          [Op.like]: `%${keyword.trim()}%`,
        },
      },
    ];
  }

  const categories = await models.ProductCategory.findAll({
    attributes: ["id", "name", "slug", "description", "storeId"],
    where: conditions,
    limit: +limit,
    offset: +limit * (+page - 1),
    order: [["order", "ASC"]],
    raw: true,
  });

  return {
    success: true,
    data: {
      items: categories,
    },
  };
}

export async function insertProductCategory(credentials, loginUser = {}) {
  const { name, order = 0, description = "" } = credentials;
  const instance = await models.ProductCategory.create({
    name,
    order,
    description,
    slug: convertToSlug(name),
    storeId: loginUser?.storeId,
    createdAt: new Date(),
    createdBy: loginUser.id,
  });
  return {
    success: true,
    data: instance,
  };
}

export async function fetchUpdateProductCategory(credentials, loginUser) {
  const { id, name, order, description } = credentials;
  if (!id) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
    };
  }
  await models.ProductCategory.update(
    {
      name,
      slug: convertToSlug(name),
      order,
      description,
      updatedAt: new Date(),
      updatedBy: loginUser.id,
    },
    {
      where: {
        id: id,
      },
    }
  );
  return {
    success: true,
  };
}

export async function destroyProductCategory(id) {
  await models.ProductCategory.destroy({
    where: {
      id,
    },
  });
  return {
    success: true,
  };
}
