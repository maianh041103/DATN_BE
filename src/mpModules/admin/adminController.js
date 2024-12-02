const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const adminService = require("./adminService");

module.exports.createAgencyController = async (req,res)=>{
    try {
        const result = await adminService.createAgencyService({...req.body});
        if (result.success)
            res.json(respondItemSuccess(result.data, result.message));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}