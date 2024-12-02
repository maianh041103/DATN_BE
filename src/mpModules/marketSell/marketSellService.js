const Sequelize = require("sequelize");
const {Op} = Sequelize;
const models = require("../../../database/models");
const {HttpStatusCode} = require("../../helpers/errorCodes");
const {getImages} = require("../../helpers/getImages");
const marketConfigContant = require("../marketConfig/marketConfigContant")
const marketSellContant = require("./marketSellContant");
const {generateCode} = require("../../helpers/codeGenerator");
const {warehouseStatus} = require("../warehouse/constant");
const {orderStatuses} = require("../order/orderConstant");
const customerContant = require("../customer/customerConstant");
const transactionContant = require("../transaction/transactionContant");
const transactionService = require("../transaction/transactionService");
const {createOrderPayment} = require("../order/OrderPaymentService");
const {customerType, customerStatus} = require("../customer/customerConstant");
const {indexCreate} = require("../saleReturn/saleReturnService");
const {addFilterByDate} = require("../../helpers/utils");
const moment = require('moment');
const {readProduct, getProductBySeri} = require("../product/productService");
const {getInventory} = require("../inventory/inventoryService");
const discountContant = require("../discount/discountContant");

const marketAddressInclude = [
    {
        model: models.Ward,
        as: "ward",
        attributes: ["id", "name", "name2"]
    },
    {
        model: models.District,
        as: "district",
        attributes: ["id", "name", "name2"]
    },
    {
        model: models.Province,
        as: "province",
        attributes: ["id", "name", "name2"]
    },
    {
        model: models.Store,
        as: "store",
        attributes: ["id", "name"]
    }
];
const storeInclude = [
    {
        model: models.MarketProduct,
        as: "marketProduct",
        attributes: [],
        required: true
    },
    {
        model: models.Image,
        as: "logo"
    }
];
const marketOrderInclude = [
    {
        model: models.MarketOrderProduct,
        as: "products",
        include: [
            {
                model: models.MarketProduct,
                as: "marketProduct",
                include: [
                    {
                        model: models.Product,
                        as: "product",
                        attributes: ["id", "name","primePrice","code", "imageUrl"]
                    },
                    {
                        model: models.ProductUnit,
                        as: "productUnit",
                        attributes: ["id", "unitName", "exchangeValue","code"]
                    },
                    {
                        model: models.Image,
                        as:"imageCenter"
                    }
                ]
            },
            {
                model:models.MarketOrderBatch,
                as:"orderBatches"
            },
            {
                model:models.DiscountItem,
                as:"discountProductItem",
                include:[
                    {
                        model:models.Discount,
                        as:"discount"
                    }
                ]
            }
        ]
    },
    {
        model: models.Store,
        as: "store",
        attributes: ["id", "name", "phone", "address"]
    },
    {
        model: models.Store,
        as: "toStore",
        attributes: ["id", "name", "phone", "address"],
    },
    {
        model: models.HistoryPurchase,
        as: "historyPurchase",
        attributes: ["id", "status", "time", "note"]
    },
    {
        model:models.Ward,
        as:"ward",
        attributes: ["name", "name2"]
    },
    {
        model:models.District,
        as:"district",
        attributes: ["name", "name2"]
    },
    {
        model:models.Province,
        as:"province",
        attributes: ["name", "name2"]
    },
    {
        model:models.Customer,
        as:"customer"
    },
    {
        model:models.DiscountItem,
        as:"discountOrderItem",
        include:[
            {
                model:models.Discount,
                as:"discount"
            }
        ]
    }
];
const marketOrderAttributes = [
    "id","code","fullName","storeId","toStoreId","toBranchId","addressId","address", "phone","status",
    "note","wardId","districtId","provinceId","isPayment","createdAt","deliveryFee","customerId",
    "cancelNote","closedNote", "totalPrice","discountItemId"
]
const storeAttributes = [
    "id", "name", "phone","email", "address", "wardId", "districtId", "provinceId","isAgency",
    [Sequelize.literal(`(SELECT COUNT(*) FROM market_products
    WHERE market_products.storeId = Store.id and market_products.deletedAt IS NULL)`), 'totalProduct'],
    [Sequelize.literal(`(SELECT SUM(market_products.quantitySold) FROM market_products
    WHERE market_products.storeId = Store.id and market_products.deletedAt IS NULL)`), 'totalQuantitySold']
];

const handlerCreateCustomer = async ({storeBuy, storeSell, t})=>{
    const firstUser = await models.User.findOne({
        where:{
            storeId:storeBuy.id
        }
    });
    const newCustomer = await models.Customer.create({
        fullName: firstUser ? firstUser.fullName : "" ,
        phone: storeBuy.phone,
        code:storeBuy.code,
        address: storeBuy.address,
        type: customerType.Company,
        status: storeBuy.status === 1 ? customerStatus.ACTIVE : customerStatus.INACTIVE,
        wardId: storeBuy.wardId,
        districtId: storeBuy.districtId,
        provinceId: storeBuy.provinceId,
        createdAt: new Date(),
        storeId: storeSell.id,
        customerStoreId: storeBuy.id,
        companyName:`${storeBuy?.name}`
    },{
        transaction:t
    });
    const code = generateCode("KH",newCustomer.id);
    await models.Customer.update({
        code,
    },{
        where:{
            id:newCustomer.id
        },
        transaction:t
    });
    newCustomer.code = code;
    return newCustomer;
}

const handlerCreateOrderPayment = async ({marketOrderId, storeId,loginUser,branchId,paid,t})=>{
    const marketOrderExists = await handleGetDetailMarketOrder({id:marketOrderId,storeId});
    if(!marketOrderExists){
        throw new Error(`Không tìm thấy đơn hàng có id = ${marketOrderId} của cửa hàng id = ${storeId}`)
    }
    let whereCustomer = {};
    if(marketOrderExists.customerId !== null){
        whereCustomer.id = marketOrderExists.customerId;
    }else{
        whereCustomer = {
            customerStoreId:marketOrderExists.storeId,
            storeId
        }
    }
    let customer = await models.Customer.findOne({
        where:whereCustomer
    });

    await models.MarketOrder.update({
        isPayment:true
    },{
        where:{
            id:marketOrderId
        },
        transaction:t
    });

    // Tạo hóa đơn
    const newOrder = await models.Order.create(
        {
            code: marketOrderExists.code,
            description: marketOrderExists.note,
            customerId: customer.id,
            totalPrice: marketOrderExists.dataValues.totalPrice,
            paymentType: (paid < marketOrderExists.dataValues.totalPrice)? "DEBT" : "BANK",
            cashOfCustomer: paid,
            customerOwes: marketOrderExists.dataValues.totalPrice - paid,
            refund: 0,
            discount: 0,
            status: orderStatuses.SUCCEED,
            userId:loginUser.id,
            storeId: loginUser.storeId,
            createdBy: loginUser.id,
            branchId: branchId,
            marketOrderId
        },
        { transaction: t }
    );
    await models.DiscountApply.update({
        orderId:newOrder.id
    },{
        where:{
            marketOrderId:marketOrderId
        },
        transaction:t
    });
    for (const item of marketOrderExists.products) {
        const productUnit = await models.ProductUnit.findOne({
            where: {
                id: item?.marketProduct?.productUnit?.id
            }
        });

        const orderProduct = await models.OrderProduct.create(
            {
                orderId: newOrder.id,
                productId: item?.marketProduct?.product?.id,
                productUnitId: item?.marketProduct?.productUnit?.id,
                isDiscount: false,
                itemPrice: item?.price * item?.quantity,
                discountPrice:0,
                productUnitData: JSON.stringify(productUnit),
                price: +item.price * +item.quantity,
                quantityBaseUnit: +item?.marketProduct?.productUnit?.exchangeValue * +item.quantity,
                quantity: item?.quantity,
                discount: 0,
                primePrice: item?.marketProduct?.product?.primePrice,
                customerId: newOrder.customerId,
                createdBy: newOrder.createdBy,
                updatedBy: newOrder.createdBy,
                createdAt: new Date(),
                comboId: null,
                quantityLast: null,
                userId:loginUser.id,
                point: 0,
                marketOrderProductId: item.id
            },
            { transaction: t }
        )

        if (item?.orderBatches) {
            for (const _batch of item?.orderBatches) {
                await models.OrderProductBatch.create(
                    {
                        orderProductId: orderProduct.id,
                        batchId: _batch.batchId,
                        quantity: _batch.quantity
                    },
                    { transaction: t }
                )
            }
        }
    }
    // End tạo hóa đơn
    // Nợ
    if(newOrder.customerOwes > 0){
        await models.CustomerDebt.create(
            {
                totalAmount: newOrder.totalPrice,
                debtAmount: newOrder.customerOwes,
                customerId: newOrder.customerId,
                orderId: newOrder.id,
                type: 'ORDER'
            },
            { transaction: t }
        )
    }
    // End nợ
    //Tạo transaction
    const idString = newOrder.id.toString()
    const typeTransaction =
        await transactionService.generateTypeTransactionOrder(loginUser.storeId)
    const newTransaction = await models.Transaction.create(
        {
            code: `TTHD${idString.padStart(9, '0')}`,
            paymentDate: new Date(),
            ballotType: transactionContant.BALLOTTYPE.INCOME,
            typeId: typeTransaction,
            value:
                newOrder.totalPrice <= newOrder.cashOfCustomer
                    ? newOrder.totalPrice
                    : newOrder.cashOfCustomer,
            createdBy: loginUser.id,
            target: transactionContant.TARGET.CUSTOMER,
            targetId: customer.id,
            isDebt: true,
            branchId: newOrder.branchId,
            isPaymentOrder: true,
            userId: loginUser.id
        },
        {
            transaction: t
        }
    )
    //End tạo transaction
    newOrder.transactionId = newTransaction.id;
    //Tạo payment
    await createOrderPayment(newOrder, t);
    //End taọ payment

}

module.exports.createAddressService = async (result) => {
    try {
        let {phone, wardId, districtId, provinceId, address, storeId, isDefaultAddress, loginUser, fullName, toStoreId, customerId} = result;
        let newAddress;
        const t = await models.sequelize.transaction(async (t) => {
            if (!phone) {
                throw new Error(`Vui lòng nhập số điện thoại giao hàng`);
            }
            const districtExists = await models.District.findOne({
                where:{
                    id: districtId,
                    provinceId
                }
            });
            if(!districtExists){
                throw new Error(`Huyện không hợp lệ`);
            }
            const wardExists = await models.Ward.findOne({
                where:{
                    id:wardId,
                    districtId
                }
            });
            if(!wardExists){
                throw new Error(`Xã không hợp lệ`)
            }
            if(toStoreId){
                const storeExists = await models.Store.findOne({
                    where:{
                        id:toStoreId
                    }
                });
                if(!storeExists){
                    throw new Error(`Không tồn tại cửa hàng có id = ${toStoreId}`);
                }
                storeId = toStoreId;
            }
            newAddress = await models.Address.create({
                phone, wardId, districtId, provinceId, address, storeId, isDefaultAddress,
                fullName, customerId
            }, {
                transaction: t
            });
            if (isDefaultAddress) {
                let where = {
                    isDefaultAddress: true,
                    id: {
                        [Op.ne]: newAddress.id
                    },
                    storeId,
                }
                if(customerId){
                    where.customerId = customerId;
                }else{
                    where.customerId = {
                        [Op.eq]:null
                    }
                }
                await models.Address.update({
                    isDefaultAddress: false
                }, {
                    where,
                    transaction: t
                });
            }
        });
        return {
            success: true,
            data: {
                item: newAddress.id
            }
        }
    } catch (e) {
        return {
            error: true,
            message: `${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.getAllAddressService = async (result) => {
    try {
        const {isDefaultAddress, limit = 20, page = 1,loginUser, storeId, toStoreId, customerId} = result;
        let where = {
            storeId
        };
        if(toStoreId){
            where = {
                storeId: toStoreId
            }
        }
        if (isDefaultAddress) {
            where.isDefaultAddress = isDefaultAddress;
        }
        if(customerId){
            where.customerId = customerId;
        }else{
            where.customerId = null;
        }
        let listAddress = await models.Address.findAll({
            where,
            include: marketAddressInclude,
            order: [["isDefaultAddress","DESC"],["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset: (parseInt(limit) * (parseInt(page) - 1))
        });
        let count = await models.Address.count({
            where,
            attributes: ["id"]
        });

        return {
            success: true,
            data: {
                items: listAddress,
                totalItem: count
            }
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.getDetailAddressService = async (result) => {
    try {
        let {id, storeId, toStoreId} = result;
        if(toStoreId){
            storeId = toStoreId;
        }
        const addressExists = await models.Address.findOne({
            where: {
                id, storeId
            },
            include: marketAddressInclude
        });
        if (!addressExists) {
            return {
                error: true,
                message: `Không tồn tại địa chỉ có id = ${id}`,
                code: HttpStatusCode.BAD_REQUEST
            }
        }
        return {
            success: true,
            data: {
                item: addressExists
            }
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.updateAddressService = async (result) => {
    try {
        let {id, storeId, phone, wardId, districtId, provinceId, address, isDefaultAddress, loginUser, fullName, toStoreId, customerId} = result;
        if(toStoreId){
            const storeExists = await models.Store.findOne({
                where:{
                    id:toStoreId
                }
            });
            if(!storeExists){
                throw new Error(`Không tồn tại cửa hàng có id = ${toStoreId}`);
            }
            storeId = toStoreId;
        }
        const addressExists = await models.Address.findOne({
            where: {
                id, storeId
            }
        });
        if (!addressExists) {
            return {
                error: true,
                message: `Không tồn tại địa chỉ có id = ${id} của cửa hàng ${storeId}`,
                code: HttpStatusCode.BAD_REQUEST
            }
        }
        const district = await models.District.findOne({
            where:{
                id:districtId,
                provinceId
            }
        });
        if(!district){
            return{
                error:true,
                message:`Quận/ huyện không hợp lệ`,
                code: HttpStatusCode.BAD_REQUEST
            }
        }
        const ward = await models.Ward.findOne({
            where:{
                id:wardId,
                districtId
            }
        });
        if(!ward){
            return{
                error:true,
                message:`Xã không hợp lệ`,
                code: HttpStatusCode.BAD_REQUEST
            }
        }
        const t = await models.sequelize.transaction(async (t)=>{
            await models.Address.update({
                phone, wardId, districtId, provinceId, address, isDefaultAddress, fullName
            }, {
                where: {
                    id
                },
                transaction:t
            });
            if (isDefaultAddress) {
                let where = {
                    id: {
                        [Op.ne]: id
                    },
                    storeId
                }
                if(addressExists.customerId){
                    where.customerId = customerId;
                }else{
                    where.customerId = null;
                }
                await models.Address.update({
                    isDefaultAddress: false
                }, {
                    where,
                    transaction:t
                })
            }
        })
        return {
            success: true,
            data: null
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.deleteAddressService = async (result) => {
    try {
        let {id, storeId, toStoreId} = result;
        if(toStoreId){
            const storeExists = await models.Store.findOne({
                where:{
                    id:toStoreId
                }
            });
            if(!storeExists){
                throw new Error(`Không tồn tại cửa hàng có id = ${toStoreId}`);
            }
            storeId = toStoreId;
        }
        const addressExists = await models.Address.findOne({
            where: {
                id, storeId
            }
        });
        if (!addressExists) {
            return {
                error: true,
                message: `Không tồn tại địa chỉ có id = ${id}`,
                code: HttpStatusCode.BAD_REQUEST
            }
        }
        await models.Address.destroy({
            where: {
                id
            }
        });
        return {
            success: true,
            data: null
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.getDetailProductService = async (result) => {
    try {
        const {id, storeId} = result;
        const marketProductDetailInclude = [
            {
                model: models.Product,
                as: "product",
                include: [{
                    model: models.GroupProduct,
                    as: "groupProduct",
                    attributes: ["id", "name"],
                }]
            },
            {
                model: models.Image,
                as: "imageCenter"
            },
            {
                model: models.Store,
                as: "store",
                attributes: ["id", "name", "phone","email", "address", "wardId", "districtId", "provinceId","isAgency",
                [Sequelize.literal(`(SELECT COUNT(*) FROM market_products
    WHERE market_products.storeId = store.id and market_products.deletedAt IS NULL)`), 'totalProduct'],
            [Sequelize.literal(`(SELECT SUM(market_products.quantitySold) FROM market_products
    WHERE market_products.storeId = store.id and market_products.deletedAt IS NULL)`), 'totalQuantitySold']],
                include: [
                    {
                        model: models.Image,
                        as: "logo"
                    },
                    {
                        model: models.RequestAgency,
                        as: "agencys",
                        where: {
                            agencyId: storeId,
                            status: marketConfigContant.AGENCY_STATUS.ACTIVE
                        },
                        required:false
                    }]
            },
            {
                model: models.MarketProductAgency,
                as: "agencys",
                attributes: ["id", "agencyId", "groupAgencyId", "price", "discountPrice"],
                where: Sequelize.literal('(`agencys`.`agencyId` = `store->agencys`.`id` ' +
                    'OR `agencys`.`groupAgencyId` = `store->agencys`.`groupAgencyId`) ' +
                    'AND `agencys`.`marketProductId` = `MarketProduct`.`id`'),
                required: false
            },
            {
                model: models.User,
                as: "userCreated",
                attributes: ["id", "fullName"]
            },
            {
                model: models.User,
                as: "userUpdated",
                attributes: ["id", "fullName"]
            },
            {
                model: models.MarketProductBatch,
                as: "batches",
                attributes: ["id", "batchId", "quantity", "quantitySold"]
            },
            {
                model: models.ProductUnit,
                as: "productUnit",
                attributes: ["id", "unitName", "exchangeValue", "code"]
            }
        ];
        const marketProduct = await models.MarketProduct.findOne({
            where: {
                id,
            },
            include: marketProductDetailInclude,
        });
        if (!marketProduct) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Không tìm thấy sản phẩm có id = ${id} trên chợ`
            }
        }

        if(! (await isProductPermission(id, storeId))){
            return{
                error:true,
                code:HttpStatusCode.BAD_REQUEST,
                message:"Bạn không có quyền truy cập sản phẩm này"
            }
        }
        if (marketProduct.images) {
            marketProduct.dataValues.images = await getImages(marketProduct.images);
        }
        if(marketProduct.imageCenter === null){
            marketProduct.dataValues.imageCenter = {
                filePath: marketProduct.product.imageUrl
            }
        }
        if (marketProduct.agencys.length > 0) {
            let index = marketProduct.agencys.findIndex(item => {
                return item.agencyId !== null;
            });
            if (index === -1) index = 0;
            marketProduct.dataValues.price = marketProduct.dataValues.agencys[index].dataValues.price;
            marketProduct.dataValues.discountPrice = marketProduct.dataValues.agencys[index].discountPrice;
        }

        let where = {
            storeId: {
                [Op.eq]: marketProduct.storeId
            },
            id:{
                [Op.ne]:marketProduct.id
            },
            status: marketConfigContant.PRODUCT_MARKET_STATUS.ACTIVE
        };

        //Check co phai la agency
        const isAgency = await models.RequestAgency.findOne({
            where:{
                storeId:marketProduct.storeId,
                agencyId:storeId,
                status:marketConfigContant.AGENCY_STATUS.ACTIVE
            }
        });
        if(!isAgency){
            where.marketType = marketConfigContant.MARKET_TYPE.COMMON;
        }

        //Tìm sản phẩm liên quan
        const listProduct = await models.MarketProduct.findAll({
            where,
            include: marketProductDetailInclude,
            limit:20,
            offset:0
        });
        for(const item of listProduct){
            if(item.imageCenter === null){
                item.dataValues.imageCenter = {
                    filePath: item.product.imageUrl
                }
            }
        }
        marketProduct.dataValues.productWillCare = listProduct;

        for(const product of listProduct){
            if (product.agencys.length > 0) {
                let index = product.agencys.findIndex(item => {
                    return item.agencyId !== null;
                });
                if (index === -1) index = 0;
                product.dataValues.price = product.dataValues.agencys[index].dataValues.price;
                product.dataValues.discountPrice = product.dataValues.agencys[index].discountPrice;
            }
            if (product.images && product.images !== "") {
                product.dataValues.images = await getImages(product.images);
            }
        }

        if (marketProduct.store) {
            marketProduct.dataValues.store.dataValues.totalProduct = parseInt(marketProduct.dataValues.store.dataValues.totalProduct);
            marketProduct.dataValues.store.dataValues.totalQuantitySold = parseInt(marketProduct.dataValues.store.dataValues.totalQuantitySold);
        }
        return {
            success: true,
            data: {
                item: marketProduct
            }
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.getAllStoreService = async (result) => {
    try {
        const {storeId, limit = 10, page = 1, isPrivateMarket, keyword} = result;
        let include = [...storeInclude];
        let includeCount = [];
        let where = {
            id: {
                [Op.ne]: storeId
            }
        }
        if(isPrivateMarket){
            const requestAgencyModel = {
                model:models.RequestAgency,
                as: "agencys",
                where: {
                    agencyId: storeId,
                    status: marketConfigContant.AGENCY_STATUS.ACTIVE
                },
                attributes: []
            }
            include.push(requestAgencyModel);
            includeCount.push(requestAgencyModel);
        }
        if (keyword) {
            where.name = {
                [Op.like]: `%${keyword}%`
            }
        }
        const listStore = await models.Store.findAll({
            where,
            attributes: storeAttributes,
            include,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });


        const count = await models.Store.count({
            where: {
                ...where,
                [Op.and]: Sequelize.literal(`EXISTS (
                SELECT 1 
                FROM market_products 
                WHERE market_products.storeId = Store.id 
                AND market_products.deletedAt IS NULL
            )`)
            },
            include: includeCount
        })
        for (let item of listStore) {
            item.dataValues.totalProduct = parseInt(item.dataValues.totalProduct);
            item.dataValues.totalQuantitySold = parseInt(item.dataValues.totalQuantitySold);
        }
        return {
            success: true,
            data: {
                items: listStore,
                totalItem: count
            }
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.getDetailStoreService = async (result) => {
    try {
        const {storeId, id} = result;
        const store = await models.Store.findOne({
            where: {
                id
            },
            attributes: storeAttributes,
            include: storeInclude
        });
        store.dataValues.totalProduct = parseInt(store.dataValues.totalProduct);
        store.dataValues.totalQuantitySold = parseInt(store.dataValues.totalQuantitySold);
        return {
            success: true,
            data: store
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.addProductToCartService = async (result) => {
    try {
        let {storeId, marketProductId, quantity, price} = result;
        const marketProductExists = await models.MarketProduct.findOne({
            where: {
                id: marketProductId,
                storeId:{
                    [Op.ne]:storeId
                }
            }
        });
        if (!marketProductExists) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Không tồn tại sản phẩm có id = ${marketProductId} trên chợ`
            }
        }
        if (!price) {
            price = marketProductExists.price;
        }
        const productInCart = await models.Cart.findOne({
            where: {
                storeId, marketProductId
            }
        });
        let totalQuantity;
        if (productInCart) {
            totalQuantity = +productInCart.quantity + quantity;
        }
        if (totalQuantity > marketProductExists.quantity - marketProductExists.quantitySold) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Số lượng thêm vào giỏ hàng không được lớn hơn số lượng bán`
            }
        }
        let resultId;
        if (!productInCart) {
            let newProductInCart = await models.Cart.create({
                storeId,
                marketProductId,
                quantity,
                price
            });
            resultId = newProductInCart.id;
        } else {
            resultId = productInCart.id;
            await models.Cart.update({
                quantity: totalQuantity
            }, {
                where: {
                    storeId, marketProductId
                }
            });
        }
        return {
            success: true,
            data: {
                id: resultId
            }
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }

}

module.exports.getProductInCartService = async (result) => {
    try {
        const {storeId, limit = 20, page = 1} = result;
        let where = {
            storeId
        };

        let include =  [{
            model: models.MarketProduct,
            as: "marketProduct",
            include: [
                {
                    model: models.Product,
                    as: "product",
                    attributes: ["id", "name", "imageUrl"]
                }, {
                    model: models.ProductUnit,
                    as: "productUnit",
                    attributes: ["id", "exchangeValue", "unitName"]
                }, {
                    model: models.Store,
                    as: "store",
                    attributes: ["id", "name","address","phone"],
                    include: [{
                        model: models.RequestAgency,
                        as: "agencys",
                        where: {
                            agencyId: storeId,
                            status: marketConfigContant.AGENCY_STATUS.ACTIVE,
                        },
                        required:false
                    }]
                }, {
                    model: models.Image,
                    as: "imageCenter"
                },
                {
                    model: models.MarketProductAgency,
                    as: "agencys",
                    where: Sequelize.literal('(`marketProduct->agencys`.`agencyId` = `marketProduct->store->agencys`.`id` ' +
                        'OR `marketProduct->agencys`.`groupAgencyId` = `marketProduct->store->agencys`.`groupAgencyId`) ' +
                        'AND `marketProduct->agencys`.`marketProductId` = `marketProduct`.`id`'),
                    required: false
                }
            ]
        }];
        const listProductInCart = await models.Cart.findAll({
            where,
            include
        });
        for(const item of listProductInCart){
            if(item.marketProduct.imageCenter === null){
                item.dataValues.marketProduct.dataValues.imageCenter = {
                    filePath: item.marketProduct.product.imageUrl
                }
            }
        }
        let listProductGroupByStore = [];
        for (let item of listProductInCart) {
            if(
                item?.marketProduct?.marketType === marketConfigContant?.MARKET_TYPE.PRIVATE
            && item?.marketProduct?.store?.agencys?.length === 0) {
                continue;
            }
            //Cập nhật giá cho đại lý
            item.dataValues.price = item.dataValues.marketProduct.dataValues.price;
            item.dataValues.discountPrice = item.dataValues.marketProduct.dataValues.discountPrice;
            if (item?.marketProduct?.agencys?.length > 0) {
                let index = item?.marketProduct?.agencys?.findIndex(tmp => {
                    return tmp.agencyId !== null;
                });
                if (index === -1) index = 0;
                item.dataValues.price = item.marketProduct.dataValues.agencys[index].price;
                item.dataValues.discountPrice = item.marketProduct.dataValues.agencys[index].discountPrice;
            }
            //End cập nhật giá cho đại lý
            let images = (item?.marketProduct?.images || "").split("/");
            if (images.length > 0) {
                item.dataValues.image = (await models.Image.findOne({
                    where: {
                        id: images[0]
                    }
                }));
            }

            let index = listProductGroupByStore.findIndex(tmp => {
                return tmp.storeId === item?.marketProduct?.storeId;
            });
            if (index > -1) {
                listProductGroupByStore[index].products.push(item);
            } else {
                listProductGroupByStore.push({
                    storeId: item?.marketProduct?.storeId,
                    products: [item]
                })
            }
        }
        return {
            success: true,
            data: {
                item: listProductGroupByStore
            }
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.updateQuantityProductInCartService = async (result) => {
    try {
        const {id, storeId, quantity} = result;
        const cartExists = await models.Cart.findOne({
            where: {
                id, storeId
            }
        });
        if (!cartExists) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Không tồn tại sản phẩm trong giỏ hàng`
            }
        }
        const marketProduct = await models.MarketProduct.findOne({
            where: {
                id: cartExists.marketProductId
            }
        });
        if (quantity > marketProduct.quantity - marketProduct.quantitySold) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: "Số lượng thêm vào giỏ hàng không được lớn hơn số lượng bán"
            }
        }
        if (quantity === 0) {
            await models.Cart.destroy({
                where: {
                    id
                }
            })
        } else {
            await models.Cart.update({
                quantity
            }, {
                where: {
                    id
                }
            });
        }
        return {
            success: true,
            data: {
                id:parseInt(id),
                quantity:parseInt(quantity)
            }
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

module.exports.updateProductInCartService = async (result) => {
    try {
        const {ids, storeId} = result;
        const t = await models.sequelize.transaction(async (t)=>{
            await models.Cart.update({
                isSelected:false
            },{
                where:{
                    id:{
                        [Op.notIn]:ids
                    },
                    storeId
                },
                transaction:t
            });

            await models.Cart.update({
                isSelected:true
            },{
                where:{
                    id:{
                        [Op.in]:ids
                    },
                    storeId
                },
                transaction:t
            })
        })
        return {
            success: true,
            data: null
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

module.exports.deleteProductInCartService = async (result) => {
    try {
        const {id, storeId} = result;
        const productInCartExists = await models.Cart.findOne({
            where: {
                id, storeId
            }
        });
        if (!productInCartExists) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Không tồn tại sản phẩm trong giỏ hàng`
            }
        }
        await models.Cart.destroy({
            where: {
                id
            }
        });
        return {
            success: true,
            data: null
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

module.exports.createMarketOrderService = async (result) => {
    try {
        let {orders, storeId} = result;
        const listNewMarketOrderBuy = [];
        const t = await models.sequelize.transaction(async (t) => {
            for (const order of orders) {
                let {addressId, listProduct, toStoreId, note, customerId, isDirectSale, discountOrderItemId} = order;

                if (!addressId) {
                    throw new Error(`Vui lòng gửi thông tin địa chỉ giao hàng`);
                }
                if(customerId){
                    const customer = await models.Customer.findOne({
                        where:{
                            id:customerId
                        }
                    });
                    let tmp = storeId;
                    storeId = customer.storeId;
                    toStoreId = tmp;
                }
                if(isDirectSale && isDirectSale === true){
                    let tmp = storeId;
                    storeId = toStoreId;
                    toStoreId = tmp;
                }
                const addressExists = await models.Address.findOne({
                    where: {
                        id: addressId,
                        storeId
                    }
                });
                if (!addressExists) {
                    throw new Error(`Không tồn tại địa chỉ giao hàng có id = ${addressId}`);
                }
                if (!listProduct || listProduct.length === 0) {
                    throw new Error(`Vui lòng mua ít nhất 1 sản phẩm`);
                }
                let newMarketOrderBuy;
                const storeSell = await models.Store.findOne({
                    where: {
                        id: toStoreId
                    }
                });
                if (!storeSell) {
                    throw new Error("Không tồn tại cửa hàng bán");
                }

                let customerWhere = {
                    storeId: storeSell?.id
                };
                if(customerId){
                    customerWhere.id = customerId;
                }else{
                    customerWhere.customerStoreId = storeId;
                }
                let customer = await models.Customer.findOne({
                    where: customerWhere
                });

                const storeExists = await models.Store.findOne({
                    where: {
                        id: storeId
                    }
                });

                if (!customer) {
                    customer = await handlerCreateCustomer({
                        storeBuy: storeExists,
                        storeSell
                    });
                }
                customerId = customer.id;

                newMarketOrderBuy = await models.MarketOrder.create({
                    addressId,
                    storeId,
                    address: addressExists.address,
                    districtId: addressExists.districtId,
                    wardId: addressExists.wardId,
                    provinceId: addressExists.provinceId,
                    status: marketSellContant.STATUS_ORDER.PENDING,
                    phone: addressExists.phone,
                    toStoreId,
                    fullName: addressExists.fullName,
                    deliveryFee: 50000,
                    note,
                    customerId,
                    discountItemId:discountOrderItemId
                }, {
                    transaction: t
                });

                let totalPrice = 0;
                for (const item of listProduct) {
                    let itemPrice = item.price;
                    if(item.discountProductItemId){
                        const discountItem = await models.DiscountItem.findOne({
                            where:{
                                id:item.discountProductItemId
                            }
                        });
                        if(!discountItem){
                            throw new Error(`Item khuyến mãi có id = ${item.discountProductItemId}  không tồn tại`);
                        }
                        const discount = await models.Discount.findOne({
                            where:{
                                id:discountItem.discountId,
                                target: discountContant.discountTarget.PRODUCT,
                                type: discountContant.discountType.PRICE_BY_BUY_NUMBER
                            }
                        });
                        if(!discount){
                            throw new Error(`Không tồn tại khuyến mãi hàng hóa mua hàng giảm giá hàng có id = ${discountItem.discountId}`);
                        }
                        if(discountItem.changeType === discountContant.discountDiscountType.TYPE_PRICE){
                            itemPrice = discountItem.fixedPrice;
                        }else{
                            itemPrice -= (discountItem.fixedPrice || 0);
                        }
                        await models.DiscountApply.create({
                            discountId:discount.id,
                            marketOrderId: newMarketOrderBuy.id
                        },{
                            transaction:t
                        });
                    }
                    totalPrice += itemPrice * item.quantity;
                    let marketProductExists = await models.MarketProduct.findOne({
                        where: {
                            id: item.marketProductId,
                        }
                    });
                    if(!marketProductExists) {
                        throw new Error(`Không tồn tại sản phẩm có id = ${item.marketProductId}`);
                    }
                    await models.MarketOrderProduct.create({
                        marketProductId: item.marketProductId,
                        marketOrderId: newMarketOrderBuy.id,
                        quantity: item.quantity,
                        price: item.price,
                        itemPrice,
                        discountItemId: item.discountProductItemId
                    }, {
                        transaction: t
                    });

                    await models.Cart.destroy({
                        where: {
                            marketProductId: item.marketProductId,
                            storeId
                        },
                        transaction: t
                    });
                }

                const code = generateCode("MK", newMarketOrderBuy.id);
                newMarketOrderBuy.code = code;
                newMarketOrderBuy.totalPrice = totalPrice;
                await models.MarketNotification.create({
                    marketOrderId: newMarketOrderBuy.id
                }, {
                    transaction: t
                });
                if(discountOrderItemId){
                    const discountItem = await models.DiscountItem.findOne({
                        where:{
                            id:discountOrderItemId
                        }
                    });
                    if(!discountItem){
                        throw new Error(`Item khuyến mãi có id = ${discountOrderItemId}  không tồn tại`);
                    }
                    const discount = await models.Discount.findOne({
                        where:{
                            id:discountItem.discountId,
                            target: discountContant.discountTarget.ORDER,
                            type: discountContant.discountType.ORDER_PRICE
                        }
                    });
                    if(!discount){
                        throw new Error(`Không tồn tại khuyến mãi giảm giá hóa đơn có id = ${discountItem.discountId}`);
                    }
                    if(discountItem.discountType === discountContant.discountDiscountType.AMOUNT){
                        totalPrice -= discountItem.discountValue;
                    }else{
                        totalPrice -= discountItem.discountValue * totalPrice;
                    }
                    await models.DiscountApply.create({
                        discountId:discount.id,
                        marketOrderId: newMarketOrderBuy.id
                    },{
                        transaction:t
                    })
                }

                await models.MarketOrder.update({
                    code, totalPrice
                }, {
                    where: {
                        id: newMarketOrderBuy.id
                    },
                    transaction: t
                });
                newMarketOrderBuy.totalPrice = totalPrice;
                listNewMarketOrderBuy.push(newMarketOrderBuy);
            }
        })

        return {
            success: true,
            data: {
                item: listNewMarketOrderBuy
            }
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

const handleGetDetailMarketOrder = async ( {id,storeId} )=>{
    let marketOrder = await models.MarketOrder.findOne({
        where: {
            id,
            [Op.or]:{
                storeId,
                toStoreId:storeId
            }
        },
        include: marketOrderInclude,
        attributes:marketOrderAttributes
    });
    if (!marketOrder) {
        throw new Error(`Không tồn tại đơn hàng có id = ${id}`);
    }
    for(const item of marketOrder.products){
        if(item.marketProduct.imageCenter === null){
            item.dataValues.marketProduct.dataValues.imageCenter = {
                filePath: item.marketProduct.product.imageUrl
            }
        }
    }
    marketOrder.dataValues.totalPrice = parseInt(marketOrder.dataValues.totalPrice);
    return marketOrder;
}

module.exports.getDetailMarketOrderService = async (result) => {
    try {
        const marketOrder = await handleGetDetailMarketOrder(result);
        for(const product of marketOrder.products){
            const series = await models.Seri.findAll({
                where:{
                    marketOrderId: product.marketOrderId,
                    marketProductId: product.marketProductId
                }
            });
            product.dataValues.series = series;
        }
        return {
            success: true,
            data: {
                item: marketOrder
            }
        }
    } catch (e) {
        return {
            error: true,
            message: `Lỗi ${e}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
}

module.exports.getAllMarketOrderService = async (result) => {
    try {
        const {
            limit = 10,
            page = 1,
            type,
            storeId,
            status,
            keyword,
            dateNumber,
            startDate,
            endDate
        } = result;
        let where = {}
        if(keyword){
            where.code = {
                [Op.like]:`%${keyword}%`
            }
        }
        if(startDate || endDate){
            where.createdAt = addFilterByDate([startDate,endDate]);
        }
        if (type === marketSellContant.MARKET_ORDER_TYPE.BUY) {
            where.storeId = storeId;
        }
        if (type === marketSellContant.MARKET_ORDER_TYPE.SELL) {
            where.toStoreId = storeId;
        }
        if (status) {
            where.status = status;
        }
        const rows = await models.MarketOrder.findAll({
            where,
            include: marketOrderInclude,
            attributes:marketOrderAttributes,
            limit: parseInt((limit)),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["createdAt", "DESC"]]
        });
        for(const row of rows){
            row.dataValues.totalPrice = parseInt(row.dataValues.totalPrice);

            //Tra ve listSeri
            for(const item of row.products){
                const series = await models.Seri.findAll({
                    where:{
                        marketOrderId: item.marketOrderId,
                        marketProductId: item.marketProductId
                    },
                    attributes:["id","code"]
                });
                item.dataValues.series = series;

                if(item.marketProduct.imageCenter === null){
                    item.dataValues.marketProduct.dataValues.imageCenter = {
                        filePath: item.marketProduct.product.imageUrl
                    }
                }
            }
        }
        const count = await models.MarketOrder.count({
            where
        });
        let filterOrderByStatus = [];
        let statusOrder = [
            marketSellContant.STATUS_ORDER.PENDING,
            marketSellContant.STATUS_ORDER.CONFIRM,
            marketSellContant.STATUS_ORDER.PROCESSING,
            marketSellContant.STATUS_ORDER.SEND,
            marketSellContant.STATUS_ORDER.CLOSED,
            marketSellContant.STATUS_ORDER.CANCEL,
            marketSellContant.STATUS_ORDER.DONE
        ];
        for(const item of statusOrder){
            let where = {
                toStoreId:storeId,
                status:item
            };
            if(dateNumber){
                const resultDate = moment().subtract(dateNumber, 'days').format('YYYY-MM-DD');
                where.createdAt = addFilterByDate([resultDate]);
            }
            const sum = await models.MarketOrder.sum('totalPrice',{
                where
            });
            const count = await models.MarketOrder.count({
                where
            });
            filterOrderByStatus.push({
                status:item,
                sum : sum ? sum : 0,
                count
            });
        }
        return {
            success: true,
            data: {
                items: rows,
                totalItem: count,
                filterOrderByStatus
            }
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

module.exports.changeStatusMarketOrderService = async (result) =>   {
    try {
        let {id, status,toBranchId, note, products, loginUser, storeId} = result;
        const marketOrderExists = await models.MarketOrder.findOne({
            where: {
                id,
            },
            include: marketOrderInclude
        });
        if (!marketOrderExists) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: "Không tìm thấy đơn hàng"
            }
        }
        const statusExists = await models.HistoryPurchase.findOne({
            where:{
                marketOrderId:id,
                status:status
            }
        });
        if(statusExists){
            return{
                error:true,
                code:HttpStatusCode.BAD_REQUEST,
                message:"Trạng thái này đã được cập nhật"
            }
        }
        const t = await models.sequelize.transaction(async (t) => {
            if(status === marketSellContant.STATUS_ORDER.CLOSED){
                await models.MarketOrder.update({
                    closedNote:note
                }, {
                    where: {
                        id
                    },
                    transaction: t
                });
            }
            await models.MarketOrder.update({
                status
            }, {
                where: {
                    id
                },
                transaction: t
            });
            await models.HistoryPurchase.create({
                marketOrderId: id,
                status,
                time: new Date(),
                createdBy:loginUser.id,
                note
            }, {
                transaction: t
            });
            //Confirm : Chọn chi nhánh bán
            if(status === marketSellContant.STATUS_ORDER.CONFIRM){
                await models.MarketOrder.update({
                    toBranchId
                },{
                    where:{
                        id
                    },
                    transaction: t
                })
            }
            if(status === marketSellContant.STATUS_ORDER.DONE && marketOrderExists.isPayment === false){
                await handlerCreateOrderPayment({marketOrderId : id, storeId:loginUser.storeId,branchId: marketOrderExists.toBranchId,loginUser, paid : 0,t})
            }
            //Processing : Tạo mã seri và chon lô cho sản phẩm bán
            if(status === marketSellContant.STATUS_ORDER.PROCESSING){
                for (const item of products) {
                    await updateSeri({
                        marketProductId:item.marketProductId,
                        listSeri: item.listSeri,
                        marketOrderId:id,
                        loginUser, storeId,
                        transaction:t
                    });
                    //Xử lý batches
                    const marketProduct = await models.MarketProduct.findOne({
                        where: {
                            id: item.marketProductId
                        },
                        include: [
                            {
                                model: models.Product,
                                as: "product"
                            },
                            {
                                model: models.MarketProductBatch,
                                as: "batches",
                                include: [
                                    {
                                        model: models.Batch,
                                        as: "batch",
                                        attributes: ["id", "expiryDate"]
                                    }
                                ]
                            }
                        ],
                        order: [
                            [{ model: 'batches->batch', as: "batch" }, 'expiryDate', 'ASC']
                        ]
                    });
                    const marketOrderProduct = await models.MarketOrderProduct.findOne({
                        where:{
                            id: item.marketOrderProductId
                        }
                    });
                    if(marketProduct?.product?.isBatchExpireControl){
                        let quantity = marketOrderProduct.quantity;
                        for(const batch of marketProduct.batches){
                            if(quantity > 0) {
                                const newMarketOrderBatch = await models.MarketOrderBatch.create({
                                    marketOrderId: id,
                                    marketOrderProductId: item.marketOrderProductId,
                                    batchId: batch.batchId,
                                    quantity: quantity <= batch.quantity ? quantity : batch.quantity
                                }, {
                                    transaction: t
                                });
                                quantity -= batch.quantity;
                            }
                        }
                    }
                }
            }
            let number;
            if (status === marketSellContant.STATUS_ORDER.SEND || status === marketSellContant.STATUS_ORDER.CANCEL) {
                if (status === marketSellContant.STATUS_ORDER.SEND) {
                    number = -1;
                }
                else {
                    await models.MarketOrder.update({
                        cancelNote: note
                    }, {
                        where: {
                            id
                        },
                        transaction:t
                    });
                    number = 1;

                    await models.Seri.destroy({
                        where:{
                            marketOrderId:id
                        }
                    },{
                        transaction:t
                    });

                    //Trả hàng
                    if(marketOrderExists.isPayment === true){
                        const order = await models.Order.findOne({
                            where:{
                                code: marketOrderExists?.code
                            },
                            include:[
                                {
                                    model:models.OrderProduct,
                                    as:"orderProducts",
                                    include:[{
                                        model:models.OrderProductBatch,
                                        as:"batches"
                                    }]
                                }
                            ]
                        });

                        if(order){
                            const products = order.orderProducts.map(item=>{
                                const batches = item.batches.map(batch=>{
                                    return {
                                        id:batch.id,
                                        quantity:batch.quantity
                                    }
                                })
                                return{
                                    productId: item.productId,
                                    productUnitId: item.productUnitId,
                                    quantity: item.quantity,
                                    price: item.price,
                                    batches
                                }
                            })
                            const saleReturn = {
                                paymentType: "DEBT",
                                paid: 0,
                                userId: order.userId,
                                customerId: order.customerId,
                                products,
                                orderId: order.id,
                                branchId: order.branchId
                            }
                            await indexCreate(saleReturn,loginUser)
                        }
                    }

                }
                for (const item of marketOrderExists.products) {
                    await models.MarketProduct.increment({
                        quantitySold: item.quantity * number * (-1)
                    }, {
                        where: {
                            id: item.marketProductId
                        },
                        transaction: t
                    });
                    await models.Inventory.increment({
                        quantity: item.quantity * number * item?.marketProduct?.productUnit?.exchangeValue
                    }, {
                        where: {
                            productId: item?.marketProduct?.product?.id,
                            branchId: marketOrderExists.toBranchId
                        },
                        transaction: t
                    });

                    const inventory = await getInventory(marketOrderExists.toBranchId, item?.marketProduct?.product?.id)
                    console.log(inventory);
                    console.log(item.quantity * item?.marketProduct?.productUnit?.exchangeValue);
                    if(!inventory || inventory === 0){
                        throw new Error("Chi nhánh không tồn tại sản phẩm bán")
                    }

                    //Check số lượng sản phẩm
                    if(inventory < item.quantity * item?.marketProduct?.productUnit?.exchangeValue){
                        throw new Error(`Sản phẩm không đủ số lượng`);
                    }


                    let whereCustomer = {};
                    if(marketOrderExists.customerId !== null){
                        whereCustomer.id = marketOrderExists.customerId;
                    }else{
                        whereCustomer = {
                            customerStoreId:marketOrderExists.storeId,
                            storeId
                        }
                    }
                    let customer = await models.Customer.findOne({
                        where:whereCustomer
                    });

                    await models.WarehouseCard.create({
                            code: marketOrderExists.code,
                            type: warehouseStatus.SALE_MARKET,
                            partner: customer?.fullName,
                            productId: item?.marketProduct?.product?.id,
                            branchId: marketOrderExists.toBranchId,
                            changeQty: item.quantity * number * item?.marketProduct?.productUnit?.exchangeValue,
                            remainQty: inventory,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }, {
                            transaction: t
                        }
                    )
                }
                const listMarketOrderBatch = await models.MarketOrderBatch.findAll({
                    where: {
                        marketOrderId: id
                    }
                });

                //Tao products
                products = [];
                for (const item of listMarketOrderBatch) {
                    const index = products.findIndex(product => product.marketOrderProductId === item.marketOrderProductId);
                    if (index === -1) {
                        products.push({
                            marketOrderProductId: item.marketOrderProductId,
                            batches: [
                                {
                                    batchId: item.batchId,
                                    quantity: item.quantity
                                }
                            ]
                        })
                    } else {
                        products[index].batches.push({
                            batchId: item.batchId,
                            quantity: item.quantity
                        })
                    }
                }

                if (products) {
                    for (const item of products) {
                        const {marketOrderProductId, batches} = item;
                        let totalQuantity = batches.reduce((cal, item) => {
                            return cal + item.quantity;
                        }, 0);
                        const marketOrderProduct = await models.MarketOrderProduct.findOne({
                            where: {
                                id:marketOrderProductId
                            }
                        });
                        if (totalQuantity != marketOrderProduct.quantity) {
                            throw new Error("Số lượng không hợp lệ");
                        }
                        for (const batch of batches) {
                            await models.MarketProductBatch.increment({
                                quantitySold: batch.quantity * number * (-1)
                            }, {
                                where: {
                                    marketProductId:marketOrderProduct.marketProductId,
                                    batchId: batch.batchId
                                },
                                transaction: t
                            });

                            await models.Batch.increment(
                                {
                                    quantity: batch.quantity * number
                                },
                                {
                                    where: {
                                        id: batch.batchId
                                    },
                                    transaction: t
                                }
                            )
                        }
                    }
                }
            }
        })

        return {
            success: true,
            data: null
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `${e}`
        }
    }
}

module.exports.updateOrderService = async (result) => {
    const {id, addressId, listProduct,storeId, note, discountOrderItemId} = result;
    const marketOrder = await models.MarketOrder.findOne({
        where: {
            id,
            [Op.or]: {
                storeId,
                toStoreId: storeId
            }
        }
    });
    if (!marketOrder) {
        return {
            error: true,
            message: `Không tồn tại đơn hàng có id = ${id}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
    if (marketOrder.status !== marketSellContant.STATUS_ORDER.PENDING) {
        return {
            error: true,
            message: "Đơn hàng đã được xác nhận. Vui lòng không sửa thông tin đơn hàng",
            code: HttpStatusCode.BAD_REQUEST
        }
    }
    const addressExists = await models.Address.findOne({
        where: {
            id: addressId,
            storeId: marketOrder.storeId
        }
    });
    if (!addressExists) {
        return {
            error: true,
            message: `Không tồn tại địa chỉ có id = ${addressId}`,
            code: HttpStatusCode.BAD_REQUEST
        }
    }
    const t = await models.sequelize.transaction(async (t) => {
        if (addressId !== marketOrder.addressId) {
            await models.MarketOrder.update({
                addressId,
                address: addressExists.address,
                phone: addressExists.phone,
                wardId: addressExists.wardId,
                districtId: addressExists.districtId,
                provinceId: addressExists.provinceId,
                fullName: addressExists.fullName,
            }, {
                where: {
                    id
                },
                transaction: t
            });
        }
        let listMarketOrderProductId = listProduct.filter(item=>{
            return item.marketOrderProductId !== undefined
        }).map(item=>{
            return item.marketOrderProductId;
        });

        await models.MarketOrderProduct.destroy({
            where:{
                id:{
                    [Op.notIn]: listMarketOrderProductId
                },
                marketOrderId: id
            }
        });
        let totalPrice = 0;
        let discountApplyIds = [];

        for(const product of listProduct){
            let itemPrice = product.price;
            if(product.discountProductItemId){
                const discountItem = await models.DiscountItem.findOne({
                    where:{
                        id:product.discountProductItemId
                    }
                });
                if(!discountItem){
                    throw new Error(`Item khuyến mãi có id = ${product.discountProductItemId}  không tồn tại`);
                }
                const discount = await models.Discount.findOne({
                    where:{
                        id:discountItem.discountId,
                        target: discountContant.discountTarget.PRODUCT,
                        type: discountContant.discountType.PRICE_BY_BUY_NUMBER
                    }
                });
                if(!discount){
                    throw new Error(`Không tồn tại khuyến mãi hàng hóa mua hàng giảm giá hàng có id = ${discountItem.discountId}`);
                }
                discountApplyIds.push(discount.id);
                if(discountItem.changeType === discountContant.discountDiscountType.TYPE_PRICE){
                    itemPrice = discountItem.fixedPrice;
                }else{
                    itemPrice -= (discountItem.fixedPrice || 0);
                }
            }

            totalPrice += itemPrice * product.quantity;
            if(product.marketOrderProductId){
                await models.MarketOrderProduct.update({
                    quantity: product.quantity,
                    price:product.price,
                    itemPrice,
                    discountItemId:product.discountProductItemId
                },{
                    where:{
                        id:product.marketOrderProductId
                    },
                    transaction: t
                });
            }else{
                await models.MarketOrderProduct.create({
                    quantity: product.quantity,
                    price: product.price,
                    marketOrderId: id,
                    marketProductId: product.marketProductId,
                    discountItemId:product.discountProductItemId
                },{
                    transaction: t
                });
            }
        }
        if(discountOrderItemId){
            const discountItem = await models.DiscountItem.findOne({
                where:{
                    id:discountOrderItemId
                }
            });
            if(!discountItem){
                throw new Error(`Item khuyến mãi có id = ${discountOrderItemId}  không tồn tại`);
            }
            const discount = await models.Discount.findOne({
                where:{
                    id:discountItem.discountId,
                    target: discountContant.discountTarget.ORDER,
                    type: discountContant.discountType.ORDER_PRICE
                }
            });
            if(!discount){
                throw new Error(`Không tồn tại khuyến mãi giảm giá hóa đơn có id = ${discountItem.discountId}`);
            }
            if(discountItem.discountType === discountContant.discountDiscountType.AMOUNT){
                totalPrice -= discountItem.discountValue;
            }else{
                totalPrice -= discountItem.discountValue * totalPrice;
            }
            discountApplyIds.push(discount.id);
        }

        await models.DiscountApply.destroy({
            where:{
                discountId:{
                    [Op.notIn]:discountApplyIds
                },
                marketOrderId:marketOrder.id
            },
            transaction: t
        });
        const listDiscountIdExists = (await models.DiscountApply.findAll({
            where:{
                discountId:{
                    [Op.in]:discountApplyIds
                },
                marketOrderId:marketOrder.id
            }
        })).map(item=>item.discountId);
        const listDiscountIdAdd = discountApplyIds.filter(item => !listDiscountIdExists.includes(item));
        const discountApplyAdd = listDiscountIdAdd.map(id=>{
            return {
                marketOrderId: marketOrder.id,
                discountId: id
            }
        });
        await models.DiscountApply.bulkCreate(discountApplyAdd,
            {
                transaction:t
            });


        console.log(totalPrice);
        await models.MarketOrder.update({
            note,totalPrice,
            discountItemId:discountOrderItemId
        },{
            where:{
                id
            },
            transaction:t
        });
    })
    return{
        success:true,
        data:null
    }
}

const isProductPermission = async (marketProductId, storeId)=>{
    const marketProduct = await models.MarketProduct.findOne({
        where:{
            id:marketProductId
        }
    });
    if(marketProduct.marketType === marketConfigContant.MARKET_TYPE.PRIVATE){
        const isAgency = await models.RequestAgency.findOne({
            where:{
                storeId:marketProduct.storeId,
                agencyId:storeId
            }
        });
        if(!isAgency){
            return false;
        }
    }
    return true;
}

module.exports.getProductPrivateService = async (result) => {
    try {
        let {storeId, limit = 10, page = 1, keyword, toStoreId,  productType, customerId, isAll} = result;
        if(customerId){
            const customerExists = await models.Customer.findOne({
                where:{
                    id:customerId
                }
            });
            toStoreId = storeId
            storeId = customerExists !== null ? customerExists.customerStoreId : -1;
        }
        let { sortBy } = result;
        let include = [
            {
                model: models.Product,
                as: "product",
                include: [{
                    model: models.GroupProduct,
                    as: "groupProduct",
                    attributes: ["id", "name"],
                }]
            },
            {
                model: models.Image,
                as: "imageCenter"
            },
            {
                model: models.Store,
                as: "store",
                where:{
                    id:toStoreId
                },
                include: [{
                    model: models.RequestAgency,
                    as: "agencys",
                    where: {
                        agencyId: storeId,
                        status: marketConfigContant.AGENCY_STATUS.ACTIVE
                    },
                    required:false
                }]
            },
            {
                model: models.MarketProductAgency,
                as: "agencys",
                where: Sequelize.literal('(`agencys`.`agencyId` = `store->agencys`.`id` OR `agencys`.`groupAgencyId` = `store->agencys`.`groupAgencyId`) AND `agencys`.`marketProductId` = `MarketProduct`.`id`'),
                required: false
            },
            {
                model: models.User,
                as: "userCreated",
                attributes: ["id", "fullName"]
            },
            {
                model: models.User,
                as: "userUpdated",
                attributes: ["id", "fullName"]
            },
            {
                model: models.MarketProductBatch,
                as: "batches",
                attributes: ["id", "batchId", "quantity", "quantitySold"]
            },
            {
                model: models.ProductUnit,
                as: "productUnit",
                attributes: ["id", "unitName", "exchangeValue","code"]
            }
        ];
        let where = {
            storeId: {
                [Op.ne]: storeId
            },
            status: marketConfigContant.PRODUCT_MARKET_STATUS.ACTIVE
        };
        if(!isAll){
            where[Op.or] = [
                {
                    // Trường hợp store A là đại lý của store B
                    [Op.and]: [
                        Sequelize.literal(`
                    EXISTS (
                        SELECT 1
                        FROM request_agency 
                        WHERE agencyId = ${storeId} 
                          AND storeId = ${toStoreId}
                          AND deletedAt IS NULL 
                          AND status = '${marketConfigContant.AGENCY_STATUS.ACTIVE}'
                    )
                `),
                        {
                            [Op.or]: [
                                { marketType: marketConfigContant.MARKET_TYPE.PRIVATE },
                                { marketType: marketConfigContant.MARKET_TYPE.COMMON }
                            ]
                        }
                    ]
                },
                {
                    // Trường hợp store A không phải là đại lý của store B
                    [Op.and]: [
                        Sequelize.literal(`
                    NOT EXISTS (
                        SELECT 1 
                        FROM request_agency 
                        WHERE agencyId = ${storeId} 
                          AND storeId = ${toStoreId}
                          AND deletedAt IS NULL
                          AND status = '${marketConfigContant.AGENCY_STATUS.ACTIVE}'
                    )
                `),
                        { marketType: marketConfigContant.MARKET_TYPE.COMMON }
                    ]
                }
            ];
        }
        if (productType) {
            let index = include.findIndex((item) => item.as === 'product');
            if(productType){
                include[index].where = {
                    type:productType
                }
            }
        }

        if (keyword && keyword.trim() !== "") {
            include.push({
                model: models.Product,
                as: "product",
                where: {
                    name: {
                        [Op.like]: `%${keyword.trim()}%`
                    }
                }
            })
        }
        if(!sortBy){
            sortBy = "createdAt";
        }
        const listMarketProduct = await models.MarketProduct.findAll({
            where,
            include,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * (parseInt(limit)),
            order: [[sortBy, "DESC"]],
        });
        const index = include.findIndex(item => {
            return item.as === "agencys";
        });
        include.splice(index, 1);
        const count = await models.MarketProduct.count({
            where,
            include
        });
        for (const marketProduct of listMarketProduct) {
            if (marketProduct.agencys.length > 0) {
                let index = marketProduct.agencys.findIndex(item => {
                    return item.agencyId !== null;
                });
                if (index === -1) index = 0;
                marketProduct.dataValues.price = marketProduct.dataValues.agencys[index].dataValues.price;
                marketProduct.dataValues.discountPrice = marketProduct.dataValues.agencys[index].discountPrice;
            }
            marketProduct.dataValues.images = await getImages(marketProduct.images);
            if(marketProduct.imageCenter === null){
                marketProduct.dataValues.imageCenter = {
                    filePath: marketProduct.product.imageUrl
                }
            }
        }
        return {
            success: true,
            data: {
                items: listMarketProduct,
                totalItem: count
            }
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `${e}`
        }
    }
}

module.exports.getSeriService = async (result) => {
    try {
        const {marketOrderProductId} = result;
        let where = {};
        const marketOrderProductExists = await models.MarketOrderProduct.findOne({
            where:{
                id:marketOrderProductId
            }
        });
        if(!marketOrderProductExists){
            return{
                error:true,
                code:HttpStatusCode.BAD_REQUEST,
                message:"Mã sản phẩm của đơn hàng không hợp lệ"
            }
        }
        const marketProduct = await models.MarketProduct.findOne({
            where:{
                id:marketOrderProductExists.marketProductId
            },
            attributes:["id","thumbnail","productId"],
            include:[
                {
                    model:models.Image,
                    as:"imageCenter"
                },
                {
                    model:models.Product,
                    as:"product",
                    attributes:["name", "imageUrl"]
                }
            ]
        });
        if(marketProduct.imageCenter === null){
            marketProduct.dataValues.imageCenter =
                {
                    filePath: marketProduct.product.imageUrl
                };
        }
        marketProduct.dataValues.quantity = marketOrderProductExists.quantity;
        const series = await models.Seri.findAll({
            where:{
                marketOrderId:marketOrderProductExists.marketOrderId,
                marketProductId:marketOrderProductExists.marketProductId
            },
            attributes:["id","code"]
        });
        return {
            success: true,
            data: {
                marketProduct,
                series
            }
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

const updateSeri = async ({marketProductId, listSeri,marketOrderId,loginUser,storeId,transaction})=>{
    const listSeriIdDestroy = listSeri.filter(item=>{
        return item.id !== undefined
    }).map(item=>{
        return item.id
    });
    await models.Seri.destroy({
        where:{
            id:{
                [Op.notIn]:listSeriIdDestroy
            },
            marketOrderId,
            marketProductId
        },
        transaction
    });

    for(const seri of listSeri){
        //Check unique code
        let where = {
            code:seri.code,
            storeId,
        }
        if(seri.id){
            where.id = {
                [Op.ne]:seri.id,
            }
        }
        const seriExists = await models.Seri.findOne({
            where,
            transaction
        });

        if(seriExists){
            throw new Error(`Mã seri ${seri.code} đã tồn tại`)
        }
        //End
        if(seri.id){
            await models.Seri.update({
                code:seri.code
            },{
                where:{
                    id:seri.id
                },
                transaction
            });
        }
        else{
            await models.Seri.create({
                code:seri.code,
                marketOrderId,
                marketProductId,
                createdBy:loginUser.id,
                storeId
            },{
                transaction
            });
        }
    }
}

module.exports.updateSeriService = async (result)=>{
    try {
        const {marketOrderId,products = [],loginUser, storeId} = result;
        const t = await models.sequelize.transaction(async (t)=>{
            for(const product of products){
                const {marketProductId, listSeri = []} = product;
                await updateSeri({marketProductId, listSeri,marketOrderId,loginUser,storeId,t});
            }
        });
        return {
            success: true,
            data: null
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

module.exports.checkSeriService = async (result)=>{
    try {
        const {loginUser, code, storeId} = result;
        const seriExists = await models.Seri.findOne({
            where:{
                code,storeId
            }
        });
        let isExists = false;
        if(seriExists){
            isExists = true
        }
        return{
            success:true,
            data:{
                isExists
            }
        }
    }catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

module.exports.marketOrderPaymentService = async (result)=>{
    try {
        const {marketOrderId, storeId,loginUser,paid} = result;
        const marketOrder = await models.MarketOrder.findOne({
            where:{
                id:marketOrderId
            }
        });
        if(!marketOrder){
            throw new Error(`Không tồn tại đơn đặt hàng có id = ${marketOrderId}`);
        }
        const t = await models.sequelize.transaction(async (t)=>{
            await handlerCreateOrderPayment({...result,branchId:marketOrder.toBranchId,t});
        })
        return {
            success: true,
            data: null
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Loi ${e}`
        }
    }
}

module.exports.getMarketProductBySeriSerive = async (result)=>{
    try {
        const {code} = result;
        const seri = await models.Seri.findOne({
            where:{
                code
            },
            include:[
                {
                    model:models.MarketProduct,
                    as:"marketProduct",
                    attributes:["id","productId"]
                }
            ]
        });

        if(!seri){
            return{
                error:true,
                message:"Mã seri không tồn tại",
                code:HttpStatusCode.BAD_REQUEST
            }
        }
        const productId = seri?.marketProduct?.productId;
        if(!productId){
            return{
                error:true,
                message:"Sản phẩm không còn tồn tại",
                code:HttpStatusCode.BAD_REQUEST
            }
        }
        const product = (await getProductBySeri(productId))?.data;
        const marketOrder = await models.MarketOrder.findOne({
            include:[{
                model:models.Customer,
                as:"customer",
                include:[{
                    model: models.Ward,
                    as:"ward",
                    attributes:["name"]
                },{
                    model: models.District,
                    as:"district",
                    attributes:["name"]
                },{
                    model:models.Province,
                    as:"province",
                    attributes:["name"]
                }]
            },{
                model: models.Ward,
                as:"ward",
                attributes:["name"]
            },{
                model: models.District,
                as:"district",
                attributes:["name"]
            },{
                model:models.Province,
                as:"province",
                attributes:["name"]
            },{
                model:models.Store,
                as:"store",
                attributes:["id","name","phone","address"]
            },{
                model:models.Store,
                as:"toStore",
                attributes:["id","name","phone","address"]
            }],
            where:{
                id:seri.marketOrderId
            }
        })
        return {
            success: true,
            data: {
                item:product,
                marketOrder
            }
        }
    } catch (e) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}

module.exports.getNotificationService = async (result)=>{
    try{
        const {storeId} = result;
        const notification = await models.MarketNotification.findAll({
            include:[
                {
                    model:models.MarketOrder,
                    as:"marketOrder",
                    where:{
                        toStoreId:storeId
                    },
                    include:[{
                        model:models.Store,
                        as:"store"
                    }]
                }
            ]
        });
        return{
            success:true,
            data:notification
        }
    }catch(e){
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${e}`
        }
    }
}