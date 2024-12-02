const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

const customerNoteInclude = [
    {
        model: models.User,
        as: "userCreate",
        attributes: ["fullName"]
    }
]

module.exports.createNote = async (params) => {
    let { note, customerId, userId, createdTime, storeId } = params;
    if (!createdTime) {
        createdTime = new Date();
    }
    const customerExists = await models.Customer.findOne({
        where: {
            id: customerId,
            storeId
        }
    });
    if (!customerExists) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Khách hàng không tồn tại"
        }
    }
    const userExists = await models.User.findOne({
        where: {
            id: userId,
            storeId
        }
    })
    if (!userExists) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Người dùng không tồn tại"
        }
    }
    const newCustomerNote = await models.CustomerNote.create({
        note, customerId, userId, createdTime
    });
    return {
        success: true,
        data: {
            "id": newCustomerNote.id
        }
    }
}

module.exports.getAllByCustomer = async (params) => {
    const { customerId, storeId, limit = 20, page = 1 } = params;
    const customerExists = await models.Customer.findOne({
        where: {
            id: customerId,
            storeId
        }
    });
    if (!customerExists) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Khách hàng không tồn tại"
        }
    }
    const { rows, count } = await models.CustomerNote.findAndCountAll({
        include: customerNoteInclude,
        where: {
            customerId
        },
        limit: limit,
        offset: (page - 1) * limit,
        order: [["createdTime", "DESC"]]
    });
    return {
        success: true,
        data: {
            items: rows,
            count: count
        }
    }
}

module.exports.updateNote = async (params) => {
    const { id, note, userId } = params;
    const noteExists = await models.CustomerNote.findOne({
        where: {
            id
        }
    });
    if (!noteExists) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Ghi chú không tồn tại"
        }
    }
    await models.CustomerNote.update({
        note, userId
    }, {
        where: {
            id
        }
    });
    return {
        success: true,
        data: null
    }
}

module.exports.deleteNote = async (params) => {
    const { id } = params;
    const customerNoteExists = await models.CustomerNote.findOne({
        where: {
            id
        }
    });
    if (!customerNoteExists) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Ghi chú khách hàng không tồn tại"
        }
    }
    await models.CustomerNote.destroy({
        where: {
            id
        }
    });

    return {
        success: true,
        data: null
    }
}