const transactionContant = require("../transaction/transactionContant");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");

module.exports.createTypeTransaction = async (params) => {
    const { name, description, ballotType, storeId } = params;
    const newRecord = await models.TypeTransaction.create({
        name, description, ballotType, storeId
    });
    return {
        success: true,
        data: {
            "id": newRecord.id
        },
    }
}

module.exports.getAllTypeTransaction = async (params) => {
    const listTypeTransaction = await models.TypeTransaction.findAll({
        where: {
            storeId: params.storeId
        }
    });

    return {
        success: true,
        data: {
            items: listTypeTransaction
        }
    }
}

module.exports.typeTransactionByBallotType = async (params) => {
    const listTypeTransaction = await models.TypeTransaction.findAll({
        where: {
            storeId: params.storeId,
            ballotType: params.ballotType
        }
    });
    return {
        success: true,
        data: {
            items: listTypeTransaction
        }
    }
}

module.exports.getDetailTypeTransaction = async (params) => {
    const typeTransaction = await models.TypeTransaction.findOne({
        where: {
            storeId: params.storeId,
            id: params.id
        }
    });
    if (!typeTransaction) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Loại sổ quỹ không tồn tại",
        }
    }
    return {
        success: true,
        data: {
            item: typeTransaction
        }
    }
}
