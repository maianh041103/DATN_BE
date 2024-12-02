import { Op } from "sequelize";

const models = require("../../../database/models");

export async function indexSupplierDebt(params) {
    let {
        page = 1,
        limit = 50,
        supplierId,
    } = params
    const debts = await models.Inbound.findAll({
        offset: +limit * (+page - 1),
        limit: +limit,
        order: [["id", "DESC"]],
        where: {
            supplierId,
            debt: { [Op.gt]: 0 }
        }
    })
    return {
        success: true,
        data: debts
    }
}