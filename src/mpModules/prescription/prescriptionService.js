const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

export async function isExistPrescription(id) {
  return !!(await models.Prescription.findOne({ where: { id } }));
}

const prescriptionInclude = [
  {
    model: models.Store,
    as: "store",
    attributes: ["id", "name", "phone"],
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
    attributes: ["id", "name", "phone"],
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
    model: models.Doctor,
    as: "doctor",
    attributes: ["name", "phone", "code", "email", "gender"],
  },
  {
    model: models.HealthFacility,
    as: "healthFacility",
    attributes: ["id", "name", "storeId"],
  },
];

function processBuildQuery(params) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    storeId = "",
    branchId = "",
    doctorId = "",
    identificationCard = "",
    healthInsuranceCard = "",
  } = params;
  const query = {
    include: prescriptionInclude,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
  };
  const where = {};
  if (keyword) {
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      code: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      phone: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  if (storeId) where.storeId = storeId;
  if (branchId) where.branchId = branchId;
  if (doctorId) where.doctorId = doctorId;
  if (identificationCard) where.identificationCard = identificationCard;
  if (healthInsuranceCard) where.healthInsuranceCard = healthInsuranceCard;
  query.where = where;
  return query;
}

export async function prescriptionFilter(params) {
  try {
    return await models.Prescription.findAll(processBuildQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexPrescriptions(params) {
  const { rows, count } = await models.Prescription.findAndCountAll(
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

export async function createPrescription(prescription) {
  const newPrescription = await models.Prescription.create(prescription);
  createUserTracking({
    accountId: newPrescription.createdBy,
    type: accountTypes.USER,
    objectId: newPrescription.id,
    action: logActions.prescription_create.value,
    data: prescription,
  });
  return {
    success: true,
    data: newPrescription,
  };
}

export async function updatePrescription(id, prescription, loginUser) {
  const findPrescription = await models.Prescription.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });

  if (!findPrescription) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Đơn thuốc không tồn tại",
    };
  }

  // check name is unique?
  const result = await checkUniqueValue("Prescription", {
    name: prescription.name,
    id: { [Op.ne]: id },
  });

  if (!result) {
    return {
      error: true,
      code: ERROR_CODE_INVALID_PARAMETER,
      message: `Đơn thuốc ${prescription.name} đã tồn tại, vui lòng chọn tên khác.`,
    };
  }

  await models.Prescription.update(prescription, {
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: prescription.updatedBy,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.prescription_update.value,
    data: { id, ...prescription },
  });

  return {
    success: true,
  };
}

export async function readPrescription(id, loginUser) {
  const findPrescription = await models.Prescription.findOne({
    include: prescriptionInclude,
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!findPrescription) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Đơn thuốc không tồn tại`,
    };
  }
  return {
    success: true,
    data: findPrescription,
  };
}

export async function deletePrescription(id, loginUser) {
  const findPrescription = await models.Prescription.findOne({
    where: {
      id,
      storeId: loginUser.storeId,
    },
  });
  if (!findPrescription) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Đơn thuốc không tồn tại",
    };
  }
  await models.Prescription.destroy({
    where: {
      id,
    },
  });
  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.prescription_delete.value,
    data: {
      id,
      name: findPrescription.name,
      storeId: findPrescription.storeId,
    },
  });
  return {
    success: true,
  };
}
