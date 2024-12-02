const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');
const inventoryCheckingService = require("./inventoryCheckingService");

//[POST] /api/mp/inventory-checking
module.exports.create = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const body = req.body;
        const result = await inventoryCheckingService.create({ storeId: loginUser.storeId, ...body });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /api/mp/inventory-checking
module.exports.getAll = async (req, res) => {
    try {
        const query = req.query || {};
        const result = await inventoryCheckingService.getAll({ ...query });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /api/mp/inventory-checking/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const branchId = req.query.branchId;
        const result = await inventoryCheckingService.detail({ id, branchId, ...req.query });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[DELETE] /api/mp/inventory-checking/:id
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const branchId = req.query.branchId;
        const result = await inventoryCheckingService.delete({ id, branchId });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}