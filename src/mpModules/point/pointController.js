const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');
const pointService = require("./pointService");

//[POST] /mp/api/point
module.exports.create = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await pointService.createPoint({
            ...req.body,
            storeId: loginUser.storeId,
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /mp/api/point/:type
module.exports.detail = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const type = req.params.type;
        const result = await pointService.detailPoint({ storeId: loginUser.storeId, type });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[PATCH] /mp/api/point
module.exports.changeStatus = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await pointService.changeStatus({ storeId: loginUser.storeId });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[DELETE] /mp/api/point
module.exports.delete = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await pointService.deletePoint({ storeId: loginUser.storeId });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /mp/api/point/check/status
module.exports.checkStatus = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await pointService.checkStatus({ storeId: loginUser.storeId });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[PATCH] /mp/api/point/:customerId
module.exports.changePointCustomer = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const customerId = req.params.customerId;
        const body = req.body || {};
        const result = await pointService.changePointCustomer({ storeId: loginUser.storeId, customerId, ...body });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

