const discountContaint = require('./discountContant');
const discountService = require('./discountService');
const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');
//[POST] /mp/api/discount
module.exports.create = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const body = req.body;
        const discount = {
            code: body.code || "",
            name: body.name || "",
            status: body.status || discountContaint.discountStatus.ACTIVE,
            note: body.note || null,
            target: body.target || discountContaint.discountTarget.ORDER,
            type: body.type || discountContaint.discountType.ORDER_PRICE,
            createdAt: new Date(),
            isMultiple: body.isMultiple,
            items: body.items || [],
            time: body.time || {},
            scope: body.scope || {},
        }

        const result = await discountService.create(discount, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[GET] /mp/api/discount
module.exports.getAll = async (req, res) => {
    try {
        const { loginUser = {} } = req;

        const condition = req.query;
        const filter = {
            page: condition.page || 1,
            limit: condition.limit || 20,
            keyword: condition.keyword || "",
            effective: condition.effective,
            target: condition.target,
            type: condition.method,
            status: condition.status,
            channel: condition.channel
        }

        const result = await discountService.getAll(filter, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[PUT] /mp/api/discount/:discountId
module.exports.update = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const body = req.body;
        const discount = {
            code: body.code || "",
            name: body.name || "",
            status: body.status || discountContaint.discountStatus.ACTIVE,
            note: body.note || null,
            target: body.target || discountContaint.discountTarget.ORDER,
            type: body.type || discountContaint.discountType.ORDER_PRICE,
            createdAt: new Date(),
            isMultiple: body.isMultiple,
            items: body.items || [],
            time: body.time || {},
            scope: body.scope || {},
        }

        const discountId = req.params.discountId;

        const result = await discountService.update(discount, discountId, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[DELETE] /mp/api/discount/:discountId
module.exports.delete = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const discountId = req.params.discountId;

        const result = await discountService.delete(discountId, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[GET] /mp/api/discount/:discountId
module.exports.getDetail = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const discountId = req.params.discountId;

        const result = await discountService.getDetail(discountId, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[POST] /mp/api/discount/order
module.exports.getDiscountByOrder = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const order = req.body || {};
        const page = req.query.page || 1;
        const limit = req.query.limit || 20;
        const type = req.query.type;
        const channel = req.query.channel;
        const filter = {
            page, limit, type, channel
        }

        const result = await discountService.getDiscountByOrder(order, filter, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[POST] /mp/api/discount/product
module.exports.getDiscountByProduct = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const order = req.body || {};
        const page = req.query.page || 1;
        const limit = req.query.limit || 20;
        const type = req.query.type;
        const channel = req.query.channel;
        const filter = {
            page, limit, type, channel
        }

        const result = await discountService.getDiscountByProduct(order, filter, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[GET] /mp/api/discount/:discountId/order
module.exports.getDiscountOrderApply = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const discountId = req.params.discountId;
        const query = req.query;

        const result = await discountService.getDiscountOrderApply(discountId, query, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[POST] /mp/api/discount/config
module.exports.createConfig = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const data = req.body;

        const result = await discountService.createConfig(data, loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[GET] /mp/api/discount/config/detail
module.exports.detailConfig = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await discountService.detailConfig(loginUser);
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

//[GET] /mp/api/discount/countApply/:discountId/:customerId
module.exports.countApply = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const {discountId, customerId} = req.params;
        const result = await discountService.countApply({loginUser, discountId, customerId});
        if (result.success) {
            res.json(respondItemSuccess(result));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}