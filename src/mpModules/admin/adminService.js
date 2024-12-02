const Sequelize = require("sequelize");
const {Op} = Sequelize;
const models = require("../../../database/models");
const {HttpStatusCode} = require("../../helpers/errorCodes");
const {customerStatus, customerType, customerTypeOptions} = require("../customer/customerConstant");
const {generateCode} = require("../../helpers/codeGenerator");

module.exports.createAgencyService = async (result)=>{
    try {
        const {storeId} = result;
        const storeExists = await models.Store.findOne({
            where:{
                id:storeId
            }
        });
        if(!storeExists){
            throw new Error(`Không tồn tại cửa hàng có id = ${storeId}`);
        }
        await models.Store.update({
            isAgency:true
        },{
            where:{
                id:storeId
            }
        });
        return{
            success:true,
            data:null
        }
    }catch(error){
        return{
            error:true,
            message:`Lỗi ${error}`,
            code:HttpStatusCode.BAD_REQUEST
        }
    }
}

