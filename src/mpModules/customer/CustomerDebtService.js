import { Op } from "sequelize";

const models = require("../../../database/models");

export async function indexOrderDebt(params) {
    let {
        page = 1,
        limit = 50,
        customerId,
    } = params
    const debts = await models.CustomerDebt.findAll({
        offset: +limit * (+page - 1),
        limit: +limit,
        order: [["id", "DESC"]],
        include: [
            {
                model: models.Order,
                as: "order",
                attributes: ["code"]
            }
        ],
        where: {
            customerId: customerId,
            debtAmount: { [Op.gt]: 0 }
        }
    })
    return {
        success: true,
        data: debts
    }
}