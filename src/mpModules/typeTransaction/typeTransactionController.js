const typeTransactionService = require("./typeTransactionService");
const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');

//[POST] /mp/api/type-transaction
module.exports.createTypeTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await typeTransactionService.createTypeTransaction({
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

//[GET] /mp/api/type-transaction
module.exports.getAllTypeTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await typeTransactionService.getAllTypeTransaction({
            storeId: loginUser.storeId
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /mp/api/type-transaction/:ballotType
module.exports.typeTransactionByBallotType = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const ballotType = req.params.ballotType
        const result = await typeTransactionService.typeTransactionByBallotType({
            storeId: loginUser.storeId,
            ballotType
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//[GET] /mp/api/type-transaction/detail/:id
module.exports.getDetailTypeTransaction = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const id = req.params.id;
        const result = await typeTransactionService.getDetailTypeTransaction({
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