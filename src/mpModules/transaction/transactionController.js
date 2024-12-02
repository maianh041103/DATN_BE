const transactionService = require("./transactionService");
const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');

//[POST] /mp/api/transaction
module.exports.createTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await transactionService.createTransaction({
            ...req.body,
            storeId: loginUser.storeId,
            createdBy: loginUser.id
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /mp/api/transaction
module.exports.getAllTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const query = req.query || {};
        const result = await transactionService.getAllTransaction({
            storeId: loginUser.storeId,
            ...query
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /mp/api/transaction/:id
module.exports.getDetailTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const id = req.params.id;
        const result = await transactionService.getDetailTransaction({
            storeId: loginUser.storeId,
            id
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[PATCH] /mp/api/transaction/:id
module.exports.updateTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const { id } = req.params || {};
        const result = await transactionService.updateTransaction({
            storeId: loginUser.storeId,
            id,
            ...(req.body || {})
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[DELETE] /mp/api/transaction/:id
module.exports.deleteTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const { id } = req.params || {};
        const result = await transactionService.deleteTransaction({
            storeId: loginUser.storeId,
            id
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}