const {
    respondItemSuccess,
    respondWithError,
} = require("../../helpers/response");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const marketConfigService = require("./marketConfigService");
import { respondWithClientError } from "../../helpers/response";

//[POST] mp/api/market/config/product
module.exports.createProduct = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await marketConfigService.createProductService(
            {
                ...req.body,
                storeId: loginUser.storeId,
                id: loginUser.id
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[GET] mp/api/market/config/product
module.exports.getAllProduct = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await marketConfigService.getAllProductService(
            {
                ...req.query,
                loginUser,
                storeId:loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[PATCH] mp/api/market/config/product/changeStatus/:id/:status
module.exports.changeStatusProduct = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const {id,status} = req.params;
        const result = await marketConfigService.changeStatusProductService(
            {
                id,status,storeId: loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[PATCH] mp/api/market/config/product/:id
module.exports.changeProduct = async (req,res)=>{
    try {
        const { loginUser = {} } = req;
        const {id} = req.params;
        const result = await marketConfigService.changeProductService(
            {
                id,storeId: loginUser.storeId,...req.body,loginUser
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[GET] mp/api/market/config/product/:id
module.exports.getDetailProduct = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const {id} = req.params;
        const result = await marketConfigService.getDetailProductService(
            {
                id,storeId: loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[DELETE] mp/api/market/config/product/:id
module.exports.deleteProduct = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const {id} = req.params;
        const result = await marketConfigService.deleteProductService(
            {
                id,storeId: loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[POST] mp/api/market/config/agency
module.exports.createAgency = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const result = await marketConfigService.createRequestAgencyService(
            {
                ...req.body,
                storeId: loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[PATCH] mp/api/market/config/agency/changeStatus/:id/:status
module.exports.changeStatusAgency = async (req, res) => {
    try {
        const { loginUser = {} } = req;
        const { id, status } = req.params;
        const {groupAgencyId} = req.body;
        const result = await marketConfigService.changeStatusAgencyService(
            {
                id, status,groupAgencyId,
                storeId: loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e));
    }
}

//[GET] mp/api/market/config/agency
module.exports.getListAgency = async (req, res) => {
        try {
            const { loginUser = {} } = req;
            const result = await marketConfigService.getListAgencyService(
                {
                    ...req.query,
                    storeId: loginUser.storeId
                }
            );
            if (result.success) res.json(respondItemSuccess(result.data));
            else res.json(respondWithError(result.code, result.message, {}));
        } catch (e) {
            res.json(respondWithClientError(e))
        }
}

//[GET] mp/api/market/config/agency/:id
module.exports.getStatusAgency = async (req,res)=>{
    try {
        const { loginUser = {} } = req;
        const {id} = req.params;
        const result = await marketConfigService.getStatusAgencyService(
            {
                id,
                storeId: loginUser.storeId,
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[PATCH] mp/api/market/config/agency/:id
module.exports.changeAgency = async (req,res)=>{
    try {
        const {id} = req.params;
        const {groupAgencyId} = req.body;
        const {loginUser} = req;
        const result = await marketConfigService.changeAgencyService(
            {
                id,
                groupAgencyId,
                storeId:loginUser
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[DELETE] mp/api/market/config/agency/:id
module.exports.deleteAgency = async (req,res)=>{
    try {
        const {id} = req.params;
        const {loginUser} = req;
        const result = await marketConfigService.deleteAgencyService(
            {
                id,
                storeId: loginUser.storeId,
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[POST] mp/api/market/config/group-agency
module.exports.createGroupAgency = async (req,res)=>{
    try {
        const { loginUser = {} } = req;
        const result = await marketConfigService.createGroupAgencyService(
            {
                ...req.body,
                storeId: loginUser.storeId,
                loginUser
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[GET] mp/api/market/config/group-agency
module.exports.getAllGroupAgency = async (req,res)=>{
    try {
        const { loginUser = {} } = req;
        const result = await marketConfigService.getAllGroupAgencyService(
            {
                ...req.query,
                storeId: loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[GET] mp/api/market/config/group-agency/:id
module.exports.getDetailGroupAgency = async (req,res)=>{
    try {
        const { loginUser = {} } = req;
        const {id} = req.params;
        const result = await marketConfigService.getDetailGroupAgencyService(
            {
                id,
                storeId: loginUser.storeId
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[PATCH] mp/api/market/config/group-agency/:id
module.exports.changeGroupAgency = async (req,res)=>{
    try {
        const { loginUser = {} } = req;
        const result = await marketConfigService.changeGroupAgencyService(
            {
                ...req.body,
                id: req.params.id,
                storeId: loginUser.storeId,
                loginUser
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

//[DELETE] mp/api/market/config/group-agency/:id
module.exports.deleteGroupAgency = async (req,res)=>{
    try {
        const { loginUser = {} } = req;
        const result = await marketConfigService.deleteGroupAgencyService(
            {
                storeId: loginUser.storeId,
                id: req.params.id,
            }
        );
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}
