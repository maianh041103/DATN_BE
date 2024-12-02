import { indexMasterInboundProducts } from "./productMasterService";
import { respondItemSuccess, respondWithError } from "../../helpers/response";
import { HttpStatusCode } from "../../helpers/errorCodes";
import { indexInventory } from "./productService";

export async function indexInventoryController(req, res) {
    try {
        const { loginUser = {} } = req;
        const { id } = req.params
        const { branchId, productUnitId } = req.query;
        const result = await indexInventory(id, loginUser.storeId, branchId, productUnitId);
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}