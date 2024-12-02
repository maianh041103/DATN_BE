const models = require("../../../database/models");

const attributes = [
    "id",
    "productId",
    "code",
    "partner",
    "branchId",
    "productUnitId",
    "changeQty",
    "remainQty",
    "type",
    "createdAt"
];

function processQuery(params) {
    const {
        page = 1,
        limit = 10,
        productId,
        branchId
    } = params;

    const query = {
        attributes,
        offset: +limit * (+page - 1),
        limit: +limit,
        order: [["createdAt", "DESC"]],
    };
    const where = {};
    if (productId) {
        where.productId = productId;
    }
    if (branchId) {
        where.branchId = branchId;
    }
    query.where = where;
    query.order = [["createdAt", "DESC"]]
    query.attributes = attributes;
    query.include = [{
        model: models.ProductUnit,
        as: "productUnit",
        attributes: ["unitName"]
    }]
    return query
}

export async function indexController(params) {
    const { rows, count } = await models.WarehouseCard.findAndCountAll(processQuery(params));
    return {
        success: true,
        data: {
            items: rows,
            totalItem: count,
        },
    };
}

export async function createWarehouseCard(payload, t) {
    const newCard = await models.WarehouseCard.create(payload, { transaction: t });
    if (!newCard.code) {
        newCard.code = generateCode(newCard.id);
        await models.WarehouseCard.update(
            { code: newCard.code },
            { where: { id: newCard.id }, transaction: t }
        )
    }
}

function generateCode(no) {
    if (no <= 0) return "TK000000";
    if (no < 10) return `TK00000${no}`;
    if (no < 100) return `TK0000${no}`;
    if (no < 1000) return `TK000${no}`;
    if (no < 10000) return `TK00${no}`;
    if (no < 100000) return `TK0${no}`;
    if (no < 1000000) return `TK${no}`;
    return no;
}
