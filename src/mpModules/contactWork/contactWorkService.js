const _ = require("lodash");
const moment = require("moment");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

const config = require("config");

const contactWorkAttributes = [
  "id",
  "name",
  "phone",
  "email",
  "content",
  "note",
  "status",
  "createdAt",
];

export async function insertContactWork(credentials) {
  try {
    const { name, phone, email, content } = credentials;

    const data = await models.ContactWork.create(credentials);

    if (
      !config.get("google.email") ||
      !config.get("google.key") ||
      !config.get("google.googleSpreadsheet")
    ) {
      return {
        success: true,
        data,
      };
    }

    // spreadsheet key is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(config.get("google.googleSpreadsheet"));

    // use service account creds
    await doc.useServiceAccountAuth({
      client_email: config.get("google.email"),
      private_key: config.get("google.key"),
    });

    await doc.loadInfo(); // loads document properties and worksheets

    // Ham cho title, id va index
    // Voi index = 0 duoc hieu la file sheet dau tien, cu nhu vay index cho cac sheet tiep theo
    const sheet = doc.sheetsByIndex[0];

    const contact = [
      data.id,
      moment().format("H:mm DD/MM/YYYY"),
      name,
      phone,
      email,
      content,
    ];

    await sheet.addRow(contact);

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

export async function fetchContactWorkList(filter) {
  try {
    const { page = 1, limit = 10, keyword = "" } = filter;

    const query = {
      attributes: contactWorkAttributes,
      offset: +limit * (+page - 1),
      limit: +limit,
      order: [["id", "DESC"]],
      raw: true,
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
        content: {
          [Op.like]: `%${keyword.trim()}%`,
        },
      };
    }

    query.where = where;

    const { rows, count } = await models.ContactWork.findAndCountAll(query);

    return {
      success: true,
      data: {
        list_contact_work: rows,
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

export async function getContactWorkDetail(id) {
  try {
    return {
      success: true,
      data: await models.ContactWork.findByPk(id, {
        attributes: contactWorkAttributes,
        where: {
          id: id,
        },
      }),
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

export async function deleteContactWorkById(id) {
  try {
    // check item exist?
    const instance = await models.ContactWork.findByPk(id, {
      attributes: ["id"],
    });

    if (!instance) {
      return {
        error: true,
        code: ERROR_CODE_ITEM_NOT_EXIST,
        message: "Liên hệ không tồn tại",
      };
    }

    await models.ContactWork.destroy({
      where: {
        id,
      },
    });

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

export async function updateContactWork(id, params) {
  try {
    if (!id) {
      return {
        error: true,
        code: ERROR_CODE_INVALID_PARAMETER,
        message: "Liên hệ không tồn tại",
      };
    }

    await models.ContactWork.update(params, {
      where: {
        id,
      },
    });

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
