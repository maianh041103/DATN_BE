const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const { HttpStatusCode } = require('../../helpers/errorCodes');
const customerNoteService = require("./customerNoteService");

//[POST] /mp/api/customer-note
module.exports.create = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await customerNoteService.createNote({
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

//[GET] /mp/api/customer-note/:customerId
module.exports.getAllByCustomer = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const customerId = req.params.customerId;
        const query = req.query || {};
        const result = await customerNoteService.getAllByCustomer({
            customerId,
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

//[PATCH] /mp/api/customer-note/:id
module.exports.update = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const id = req.params.id;
        const result = await customerNoteService.updateNote({
            ...req.body,
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

//[DELETE] /mp/api/customer-note/:id
module.exports.delete = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const id = req.params.id;
        const result = await customerNoteService.deleteNote({
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