const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const userLogInclude = [
    {
        model: models.User,
        as: "createdBy",
        attributes: ["id", "fullName"]
    }
]
module.exports.getAll = async (params) => {
    const { branchId, limit = 10, page = 1, storeId } = params;
    let where = {};
    if(branchId){
        where.branchId = branchId;
    }
    if(storeId){
        userLogInclude.push({
            model:models.Branch,
            as:"branch",
            where:{
                storeId
            }
        });
    }
    const { rows, count } = await models.UserLog.findAndCountAll({
        where,
        include: userLogInclude,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["createdAt", "DESC"]]
    })
    return {
        success: true,
        data: {
            items: rows,
            totalItem: count
        },
    }
}