import {indexController} from "./warehouseService";
import {respondItemSuccess, respondWithError} from "../../helpers/response";
import {HttpStatusCode} from "../../helpers/errorCodes";

export async function getWarehouseCard(req, res) {
    try {
        const result = await indexController(req.query);
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

export async function getWarehouseInventory(req, res) {
}