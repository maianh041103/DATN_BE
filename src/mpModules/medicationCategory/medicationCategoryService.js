const { convertToSlug } = require("../../helpers/utils");
const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

const includeMedicationCategory = [
  {
    model: models.Unit,
    as: "unit",
    attributes: ["id", "name", "slug"],
  },
  {
    model: models.Manufacture,
    as: "manufacture",
    attributes: ["id", "name"],
  },
  {
    model: models.CountryProduce,
    as: "country",
    attributes: ["id", "name"],
  },
];

export async function indexMedicationCategories(filter) {
  const { keyword = "", name = "", page = 1, limit = 10 } = filter;
  const conditions = { storeId: null };
  if (keyword) {
    conditions[Op.or] = [
      {
        name: {
          [Op.like]: `%${keyword.trim()}%`,
        },
      },
      {
        code: {
          [Op.like]: `%${keyword.trim()}%`,
        },
      },
      {
        registerNumber: {
          [Op.like]: `%${keyword.trim()}%`,
        },
      },
      {
        activeElement: {
          [Op.like]: `%${keyword.trim()}%`,
        },
      },
      {
        content: {
          [Op.like]: `%${keyword.trim()}%`,
        },
      },
    ];
  }

  if (name) {
    conditions[Op.or] = {
      name: {
        [Op.like]: `%${name.trim()}%`,
      },
    };
  }

  const [items, count] = await Promise.all([
    models.MedicationCategory.findAll({
      attributes: [
        "id",
        "name",
        "type",
        "code",
        "registerNumber",
        "activeElement",
        "content",
        "packingSpecification",
        "manufactureId",
        "countryId",
        "unitId",
        "storeId",
      ],
      include: includeMedicationCategory,
      where: conditions,
      limit: +limit,
      offset: +limit * (+page - 1),
    }),
    models.MedicationCategory.count({ where: conditions }),
  ]);
  return {
    success: true,
    data: {
      items,
      totalItem: count,
    },
  };
}

export async function readMedicationCategoryByCode(code) {
  const findMedicationCategory = await models.MedicationCategory.findOne({
    attributes: [
      "id",
      "name",
      "type",
      "code",
      "registerNumber",
      "activeElement",
      "content",
      "packingSpecification",
      "manufactureId",
      "countryId",
      "unitId",
      "storeId",
    ],
    include: includeMedicationCategory,
    where: {
      code,
      storeId: null,
    },
  });
  return {
    success: true,
    data: findMedicationCategory,
  };
}

export async function createMedicationCategory(credentials, loginUser = {}) {
  const {
    name,
    code,
    link,
    registerNumber,
    countryId,
    unitId,
    storeId,
    packingSpecification,
    activeElement,
    content,
    manufactureId,
  } = credentials;
  const instance = await models.MedicationCategory.create({
    name,
    code,
    link,
    registerNumber,
    activeElement,
    content,
    countryId,
    packingSpecification,
    unitId,
    manufactureId,
    storeId: loginUser?.storeId,
    createdAt: new Date(),
    createdBy: loginUser.id,
  });
  return {
    success: true,
    data: instance,
  };
}

export async function updateMedicationCategory(credentials, loginUser) {
  const { id } = credentials;
  delete credentials.id;
  if (!id) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
    };
  }
  await models.MedicationCategory.update(
    {
      ...credentials,
      updatedAt: new Date(),
      updatedBy: loginUser.id,
    },
    {
      where: {
        id,
      },
    }
  );
  return {
    success: true,
  };
}

export async function deleteMedicationCategory(id) {
  await models.MedicationCategory.destroy({
    where: {
      id,
    },
  });
  return {
    success: true,
  };
}
