const transactionContant = require("../transaction/transactionContant");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

module.exports.createUserTransaction = async (params) => {
    const { name, phone, address, wardId, districId, provinceId, note, storeId } = params;
    //phone = formatMobileToSave(phone);
    const newRecord = await models.UserTransaction.create({
        name, phone, address, wardId, districId, provinceId, note, storeId
    });
    return {
        success: true,
        data: {
            "id": newRecord.id
        },
    }
}

module.exports.getAll = async (params) => {
    const listUserTransaction = await models.UserTransaction.findAll({
        where: {
            storeId: params.storeId
        }
    });
    return {
        success: true,
        data: {
            items: listUserTransaction
        }
    }
}

module.exports.getDetail = async (params) => {
    const userTransaction = await models.UserTransaction.findOne({
        where: {
            id: params.id,
            storeId: params.storeId
        }
    });
    if (!userTransaction) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Loại người thu/nộp sổ quỹ không tồn tại",
        }
    }
    return {
        success: true,
        data: {
            item: userTransaction
        }
    }
}