const models = require('../../../database/models/index');
const { HttpStatusCode } = require('../../helpers/errorCodes');
const { Sequelize, Op, where } = require("sequelize");
const _ = require("lodash");
const axios = require('axios');
const categoryContant = require("./categoryContant");
const {getNextValue, getNextValueTransactione} = require("../product/productCodeService");
const codeGenerator = require("../../helpers/codeGenerator");
const {generateCode} = require("../../helpers/codeGenerator");
const {addSourceMappingUrl} = require("@babel/cli/lib/babel/util");
const {productStatuses} = require("../product/productConstant");
const marketConfigContant = require("../marketConfig/marketConfigContant");
const {createWarehouseCard} = require("../warehouse/warehouseService");
const {warehouseStatus} = require("../warehouse/constant");

const createCategories = async (categories, storeId, t) => {
    const payload = categories.map(item=>
    {
        return{
            name:item.name,
            slug:item.name,
            storeId
        }
    });
    const groupProducts =  await models.GroupProduct.bulkCreate(payload,
        {
            transaction: t
        });
    return groupProducts;
}

module.exports.createFromMedicineMarket = async (payload) => {
    await models.sequelize.transaction(async (t) => {
        const {token, storeId, branchId} = payload;
        const categories = categoryContant.categories;
        let groupProducts = await createCategories(categories, storeId, t);
        const apiUrl = `https://chothuoc24h.vn/searchProduct`;
        groupProducts = groupProducts.map(item=>{
            const category = categories.find(category => category.name === item.name);
            return {
                ...item,
                categoryId: category.id
            }
        });

        for (const category of groupProducts) {
            let currentPage = 1;
            while (true) {
                const body = new URLSearchParams();
                body.append('page', currentPage);
                body.append('categoryId', category.categoryId);
                const response = await axios.post(apiUrl, body, {
                    headers: {
                        'Accept': '*/*',
                        'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                        'Connection': 'keep-alive',
                        'Cookie': token,
                        'Origin': 'https://chothuoc24h.vn',
                        'Referer': `https://chothuoc24h.vn/tim-kiem.html?category=${category.categoryId}`,
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-origin',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                        'X-CSRF-TOKEN': 'e8LHxltrHQnxKIpZT29U1LOXeR2lQGlu9wf5qMqY',
                        'X-Requested-With': 'XMLHttpRequest',
                        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"'
                    }
                });
                const products = response.data;
                let productToSave = [];
                for(const product of products.data) {
                    const nextValue = await getNextValueTransactione(storeId, 1, t);
                    const code = generateCode("TH", nextValue);
                    productToSave.push({
                        name: product.name,
                        shortName: product.common_name ? product.common_name : product.name,
                        slug: product.name,
                        code,
                        barCode: code,
                        groupProductId: category.dataValues.id,
                        imageUrl: `https://chothuoc24h.vn/storage/${product.image}`,
                        price: product.price,
                        storeId: storeId,
                        type: 1,
                        drugCode: "",
                        status: productStatuses.ACTIVE,
                        inventory: 1000,
                        baseUnit: product.unit || "",
                    })
                }
                const newProducts = await models.Product.bulkCreate(productToSave,{
                    transaction: t
                });
                await createInventory(newProducts, branchId, t);
                const unitToSave = newProducts.map(item=>{
                        return{
                            productId: item.id,
                            unitName: item.baseUnit,
                            exchangeValue: 1,
                            price: item.price,
                            isDirectSale: item.isDirectSale || false,
                            isBaseUnit: true,
                            quantity: item.quantity || 0,
                            code: item.code,
                            barCode: item.barCode || "",
                            storeId: item.storeId
                        }
                });
                const newUnits = await models.ProductUnit.bulkCreate(unitToSave,{
                    transaction: t
                });
                const marketProductToSave = newUnits.map(item=>{
                    return {
                        productId: item.productId,
                        productUnitId: item.id,
                        quantity: 0,
                        marketType: marketConfigContant.MARKET_TYPE.COMMON,
                        price: item.price,
                        discountPrice: 0,
                        status: marketConfigContant.PRODUCT_MARKET_STATUS.ACTIVE,
                        isDefaultPrice: true,
                        storeId: item.storeId
                    }
                });
                await models.MarketProduct.bulkCreate(marketProductToSave,{
                    transaction:t
                });
                if (currentPage === products.totalPages) {
                    break;
                }
                currentPage++;
            }
        }
    });

    return {
        success:true,
        data:null
    }
}

const createInventory = async (products, branchId, t)=>{
    const warehouseCards = products.map(item => {
        return {
            type: warehouseStatus.ADJUSTMENT,
            partner: "",
            productId: item.id,
            branchId: branchId,
            changeQty: item.inventory,
            remainQty: item.inventory,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    })
    let newWarehouseCards = await models.WarehouseCard.bulkCreate(warehouseCards, { transaction: t });
    const ids = newWarehouseCards.map(item=>item.id);

    const updateQueries = newWarehouseCards.map(item =>
        `UPDATE warehouse_card SET code = '${generateCode("KK", item.id)}' WHERE id = ${item.id}`
    );

    await Promise.all(
        updateQueries.map(query =>
            models.sequelize.query(query, { transaction: t })
        )
    );
}

module.exports.createFromWholesaleMedicine= async (payload) => {

}