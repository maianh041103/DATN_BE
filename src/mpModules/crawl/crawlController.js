const crawlService = require("./crawlService")
const {respondItemSuccess, respondWithError} = require("../../helpers/response");
const {HttpStatusCode} = require("../../helpers/errorCodes");

module.exports.pullFromMedicineMarket = async (req, res) => {
    try {
        const result = await crawlService.createFromMedicineMarket({
            ...req.body,
        });
        if (result.success) {
            res.json(respondItemSuccess(result.data));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

module.exports.pullFromWholesaleMedicine = async (req, res) => {
    try {
        const result = await crawlService.createFromWholesaleMedicine({
            ...req.body,
        });
        if (result.success) {
            res.json(respondItemSuccess(result.data));
        }
        else
            res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        console.log(error);
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}
