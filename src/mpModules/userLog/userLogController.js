const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');
const userService = require("./userLogService");

//[GET] /mp/api/user_log
module.exports.getAll = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const { limit, page, branchId } = req.query;
        const result = await userService.getAll({
            ...loginUser, limit, page, branchId, storeId:loginUser.storeId
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}