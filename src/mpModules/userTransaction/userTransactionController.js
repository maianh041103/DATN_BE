const userTransactionService = require("./userTransactionService");
const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');

//[POST] /mp/api/user-transaction
module.exports.createUserTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await userTransactionService.createUserTransaction({
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

//[GET] /mp/api/user-transaction
module.exports.getAll = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await userTransactionService.getAll({
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

//[GET] /mp/api/user-transaction/:id
module.exports.getDetail = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const id = req.params.id;
        const result = await userTransactionService.getDetail({
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