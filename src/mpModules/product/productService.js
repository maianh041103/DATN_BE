import {getNextValue} from "./productCodeService";
import {addInventory, getInventory, newInventory} from "../inventory/inventoryService";
import {raiseBadRequestError} from "../../helpers/exception";
import {createWarehouseCard} from "../warehouse/warehouseService";
import {warehouseStatus} from "../warehouse/constant";
import {MARKET_TYPE} from "../marketConfig/marketConfigContant";
import {STATUS_ORDER} from "../marketSell/marketSellContant";
import {findAllBatchByProductId} from "../batch/batchService";

const moment = require("moment");
const {
    promotionProgramToCustomerFilter,
} = require("../promotionProgram/promotionToCustomerService");
const {
    promotionProgramToProductFilter,
} = require("../promotionProgram/promotionToProductService ");
const {
    productToCustomerPercentDiscountFilter,
} = require("../promotionProgram/productToCustomerPercentDiscountService");
const {
    productStatisticFilter,
} = require("../productStatistic/productStatisticService");
const {createUserTracking} = require("../behavior/behaviorService");
const Sequelize = require("sequelize");
const _ = require("lodash");
const {Op} = Sequelize;
const models = require("../../../database/models");
const {
    checkUniqueValue,
    formatEndDateTime,
    removeDiacritics,
    formatExcelDate
} = require("../../helpers/utils");
const {
    productStatuses,
    productTypes,
    productTypeCharacters,
} = require("./productConstant");
const {
    customerType,
    customerStatus,
} = require("../customer/customerConstant");
const {HttpStatusCode} = require("../../helpers/errorCodes");
const {accountTypes, logActions} = require("../../helpers/choices");
const {productIncludes, productAttributes} = require("./constant")
const {queryFilter} = require("./filter")
const generateCode = require("../../helpers/codeGenerator");
const now = moment();

export async function productFilter(params) {
    try {
        return await models.Product.findAll(await queryFilter(params));
    } catch (e) {
        console.log(e);
        return [];
    }
}

export async function countProduct(query) {
    try {
        const invInclude = query.include.find(x => x.as === 'inventories')
        const unitInclude = query.include.find(x => x.as === 'productUnit')
        delete query.order
        query.include = [];
        if (invInclude) {
            query.include.push(invInclude);
        }
        if(unitInclude && unitInclude.where){
            query.include.push(unitInclude);
        }
        query.attributes = ["id"]
        query.distinct = true;

        return await models.Product.count(query);
    } catch (e) {
        console.log(e);
        return 0;
    }
}

export async function indexProducts(params) {
    const query = await queryFilter(params);
    const [items, count] = await Promise.all([
        models.Product.findAll(query),
        countProduct(query)
    ]);
    for (const item of items) {
        item.dataValues.inventory = parseInt(await getInventory(params.branchId, item.id));
        item.dataValues.batches = await findAllBatchByProductId(item.id, params.branchId);
    }
    return {
        success: true,
        data: {
            items,
            totalItem: count,
        },
    };
}

export async function indexProductsByGroup(params){
    const result = indexProducts(params);
    if(result.success){
        const products = result.data.items;
        for(let product of products){

        }
    }
}

function getCode(type) {
    switch (type) {
        case productTypes.THUOC:
            return productTypeCharacters.THUOC;
        case productTypes.HANGHOA:
            return productTypeCharacters.HANGHOA;
        case productTypes.COMBO:
            return productTypeCharacters.COMBO;
        case productTypes.DONTHUOC:
            return productTypeCharacters.DONTHUOC;
        default:
            return "";
    }
}

function generateProductCode(type, no) {
    const code = getCode(type);
    if (no <= 0) return `${code}000000000`;
    if (no < 10) return `${code}00000000${no}`;
    if (no < 100) return `${code}0000000${no}`;
    if (no < 1000) return `${code}000000${no}`;
    if (no < 10000) return `${code}00000${no}`;
    if (no < 100000) return `${code}0000${no}`;
    if (no < 1000000) return `${code}000${no}`;
    if (no < 10000000) return `${code}00${no}`;
    if (no < 100000000) return `${code}0${no}`;
    if (no < 1000000000) return `${code}${no}`;
    return no;
}

export async function createProduct(product, loginUser) {
    if (product.code) {
        const checkUniqueCode = await checkUniqueValue("Product", {
            code: product.code,
            branchId: product.branchId,
            storeId: product.storeId,
        });
        if (!checkUniqueCode) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Mã hàng ${product.code} đã tồn tại.`,
            };
        }
    }
    if (product.productUnits) {
        let cntCode = {};
        let cntBarCode = {};
        cntCode[product.code] = 1;
        cntBarCode[product.barCode] = 1;
        for (const item of product.productUnits) {
            if (item.code) {
                cntCode[item.code] = (cntCode[item.code] || 0) + 1;
            }
            if(item.barCode){
                cntBarCode[item.barCode] = (cntBarCode[item.barCode] || 0) + 1;
            }
        }
        let checkCode = false;
        for(const item in cntCode){
            if(cntCode[item] > 1){
                checkCode = true;
            }
        }
        if (checkCode) {
            return {
                error: true,
                message: "Mã code là duy nhất",
                code: HttpStatusCode.BAD_REQUEST
            }
        }
        let checkBarCode = false;
        for(const item in cntBarCode){
            if(cntBarCode[item] > 1){
                checkBarCode = true;
            }
        }
        if (checkBarCode) {
            return {
                error: true,
                message: "Mã vạch là duy nhất",
                code: HttpStatusCode.BAD_REQUEST
            }
        }
    }
    if (product.barCode) {
        product.barCode = removeDiacritics(product.barCode);
        const checkUniqueBarCode = await checkUniqueValue("Product", {
            barCode: product.barCode,
            storeId: product.storeId,
        });
        if (!checkUniqueBarCode) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Mã vạch ${product.barCode} đã tồn tại.`,
            };
        }
    }
    let newProduct
    await models.sequelize.transaction(async (t) => {

        newProduct = await models.Product.create({
            ...product,
            ...(product.type === productTypeCharacters.THUOC && {
                isBatchExpireControl: true,
            }),
        }, {transaction: t});
        await newInventory(product.branchId, newProduct.id, product.inventory, t)

        let newInventoryCheking;

        if (product.inventory && product.isBatchExpireControl == false) {
            newInventoryCheking = await models.InventoryChecking.create({
                userCreateId: product.createdBy,
                branchId: product.branchId
            }, {
                transaction: t
            });
            await models.InventoryChecking.update({
                code: generateCode.generateCode("KK", newInventoryCheking.id)
            }, {
                where: {
                    id: newInventoryCheking.id
                },
                transaction: t
            });

            await createWarehouseCard({
                code: generateCode.generateCode("KK", newInventoryCheking.id),
                type: warehouseStatus.ADJUSTMENT,
                partner: "",
                productId: newProduct.id,
                branchId: product.branchId,
                changeQty: product.inventory,
                remainQty: product.inventory,
                createdAt: new Date(),
                updatedAt: new Date()
            }, t);
        }
        if (!product.code) {
            const nextValue = await getNextValue(product.storeId, product.type)
            const code = generateProductCode(product.type, nextValue)
            product.code = code
            if (!product.barCode) {
                product.barCode = code
            }
            await models.Product.update(
                {code: code, barCode: product.barCode},
                {where: {id: newProduct.id}, transaction: t}
            );
        }

        // add product units
        const productUnits = _.get(product, "productUnits", []).map((item) => ({
            productId: newProduct.id,
            unitName: item.unitName,
            exchangeValue: item.exchangeValue,
            price: item.price,
            isDirectSale: item.isDirectSale || false,
            isBaseUnit: item.isBaseUnit || false,
            quantity: item.quantity || 0,
            code: item.code || item.code,
            barCode: item.barCode || "",
            point: item.point || 0,
            storeId: product.storeId,
            createdBy: loginUser.id,
        }));
        for (const productUnit of productUnits) {
            if (productUnit.isBaseUnit) {
                productUnit.code = product.code
                productUnit.barCode = product.barCode
            } else {
                if (!productUnit.code) {
                    const nextValue = await getNextValue(product.storeId, product.type)
                    productUnit.code = generateProductCode(product.type, nextValue)
                    if (!productUnit.barCode) {
                        productUnit.barCode = productUnit.code
                    }
                }
            }
        }
        for (const productUnit of productUnits) {
            const newProductUnit = await models.ProductUnit.create(productUnit, {
                transaction: t
            });
            if (newProductUnit.isBaseUnit == true && product.inventory && product.isBatchExpireControl == 0) {
                await models.InventoryCheckingProduct.create({
                    inventoryCheckingId: newInventoryCheking.id,
                    productUnitId: newProductUnit.id,
                    realQuantity: product.inventory,
                    difference: product.inventory
                }, {
                    transaction: t
                })
            }
        }
        // sendTelegram({ message: 'Tạo thành công sản phẩm:' + JSON.stringify(newProduct) });
    })
    createUserTracking({
        accountId: loginUser.id,
        type: accountTypes.USER,
        objectId: newProduct.id,
        action: logActions.product_create.value,
        data: product,
    });

    return {
        success: true,
        data: newProduct,
    };
}

export async function indexProductCombo(params, loginUser) {
    const {siteId, siteIds = []} = params;
    const where = {};
    if (_.isArray(siteIds) && siteIds.length) {
        let isNull = false;
        for (let i = 0; i < siteIds.length; i++) {
            if (siteIds[i] == 0) {
                isNull = true;
            }
        }
        let whereSiteId = {
            [Op.in]: siteIds,
        };
        if (isNull) {
            whereSiteId = {
                [Op.or]: {
                    [Op.in]: siteIds,
                    [Op.eq]: null,
                },
            };
        }
        where.siteId = whereSiteId;
    } else if (siteId) {
        where.siteId = {
            [Op.or]: [
                {
                    [Op.eq]: siteId,
                },
                {
                    [Op.eq]: null,
                },
            ],
        };
    }
    // get list of product and combo
    const p = models.Product.findAll({
        include: [
            {
                model: models.ProductGroup,
                as: "group",
                attributes: ["id", "name"],
            },
        ],
        attributes: [
            "id",
            "name",
            "code",
            "price",
            "siteId",
            "endMonth",
            "endDate",
        ],
        where: {
            ...where,
            status: productStatuses.ACTIVE,
        },
    });
    const c = models.Combo.findAll({
        include: [
            {
                model: models.Product,
                as: "products",
                attributes: [
                    "id",
                    "name",
                    "code",
                    "endMonth",
                    "endDate",
                    [Sequelize.literal("`products->ProductCombo`.price"), "price"],
                ],
                include: [
                    {
                        model: models.ProductGroup,
                        as: "group",
                        attributes: ["id", "name"],
                    },
                ],
                through: {
                    attributes: ["price"],
                },
            },
        ],
        attributes: ["id", "name", "code", "siteId"],
        where: {
            ...where,
            status: productStatuses.ACTIVE,
        },
    });
    const [products = [], combos = []] = await Promise.all([p, c]);
    return {
        products,
        combos,
    };
}

// update one product
export async function updateProduct(id, product, loginUser) {
    const findProduct = await models.Product.findOne({
        where: {
            id,
            storeId: loginUser.storeId,
        },
    });

    if (!findProduct) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Không tồn tại sản phẩm.",
        };
    }

    if (product.code) {
        const checkUniqueCode = await checkUniqueValue("Product", {
            code: product.code,
            branchId: product.branchId,
            storeId: product.storeId,
            id: {
                [Op.ne]: findProduct.id,
            },
        });
        const checkUniqueCodeUnit = await checkUniqueValue("ProductUnit",{
            code: product.code,
            storeId: product.storeId,
            [Op.or]:[
                {
                    productId: {
                        [Op.ne]: findProduct.id,
                    }
                },
                {
                    [Op.and]:[
                        {
                            productId: {
                                [Op.eq]: findProduct.id
                            }
                        },
                        {isBaseUnit: false}
                    ]
                }
            ]
        });
        if (!checkUniqueCode || !checkUniqueCodeUnit) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Mã hàng ${product.code} đã tồn tại.`,
            };
        }
    }

    if (product.productUnits) {
        let cntCode = {};
        let cntBarCode = {};
        cntCode[product.code] = 1;
        cntBarCode[product.barCode] = 1;
        for (const item of product.productUnits) {
            if (item.code) {
                cntCode[item.code] = (cntCode[item.code] || 0) + 1;
            }
            if(item.barCode){
                cntBarCode[item.barCode] = (cntBarCode[item.barCode] || 0) + 1;
            }
        }
        let checkCode = false;
        for(const item in cntCode){
            if(cntCode[item] > 1){
                checkCode = true;
            }
        }
        if (checkCode) {
            return {
                error: true,
                message: "Mã code là duy nhất",
                code: HttpStatusCode.BAD_REQUEST
            }
        }
        let checkBarCode = false;
        for(const item in cntBarCode){
            if(cntBarCode[item] > 1){
                checkBarCode = true;
            }
        }
        if (checkBarCode) {
            return {
                error: true,
                message: "Mã vạch là duy nhất",
                code: HttpStatusCode.BAD_REQUEST
            }
        }
    }

    if (product.barCode) {
        product.barCode = removeDiacritics(product.barCode);
        const checkUniqueBarCode = await checkUniqueValue("Product", {
            barCode: product.barCode,
            branchId: product.branchId,
            storeId: product.storeId,
            id: {
                [Op.ne]: findProduct.id,
            },
        });
        if (!checkUniqueBarCode) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Mã vạch ${product.barCode} đã tồn tại.`,
            };
        }
    }

    await models.sequelize.transaction(async (t) => {
        if (product.inventory) {
            const inventory = await getInventory(product.branchId, id)
            const change = product.inventory - inventory;
            if (change) {
                await addInventory(product.branchId, id, change, t)
                if (product.inventory) {
                    await createWarehouseCard({
                        code: "",
                        type: warehouseStatus.ADJUSTMENT,
                        partner: "",
                        productId: id,
                        branchId: product.branchId,
                        changeQty: change,
                        remainQty: product.inventory,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }, t);
                    const newInventoryChecking = await models.InventoryChecking.create({
                        userCreateId: loginUser.id,
                        branchId: product.branchId
                    }, {
                        transaction: t
                    });
                    await models.InventoryChecking.update({
                        code: generateCode.generateCode("KK", newInventoryChecking.id)
                    }, {
                        where: {
                            id: newInventoryChecking.id
                        },
                        transaction: t
                    });
                    for (const item of product.productUnits) {
                        if (item.isBaseUnit == true) {
                            await models.InventoryCheckingProduct.create({
                                inventoryCheckingId: newInventoryChecking.id,
                                productUnitId: item.id,
                                realQuantity: product.inventory,
                                difference: change
                            }, {
                                transaction: t
                            })
                        }
                    }
                }
            }

        }
        if(product.imageId){
            product.imageUrl = "";
        }
        await models.Product.update(product, {
            where: {
                id,
            }, transaction: t
        });
        // upsert product units
        const productUnits = _.get(product, "productUnits", []);
        const updatedProductUnits = [];
        for (const item of productUnits) {
            const upsertPayload = {
                productId: id,
                unitName: item.unitName,
                exchangeValue: item.exchangeValue,
                price: item.price,
                isDirectSale: item.isDirectSale || false,
                isBaseUnit: item.isBaseUnit || false,
                code: item.isBaseUnit ? product.code : (item.code || ""),
                barCode: item.isBaseUnit ? product.barCode : (item.barCode || ""),
                point: item.point || 0,
                branchId: findProduct.branchId,
                storeId: findProduct.storeId,
                createdBy: loginUser.id,
            };
            if (item.id) {
                await models.ProductUnit.update(upsertPayload, {
                    where: {
                        id: item.id,
                    }, transaction: t
                });
            } else {
                console.log(upsertPayload)
                const instance = await models.ProductUnit.create(upsertPayload, {transaction: t});
                item.id = instance.id;
                if (!instance.code) {
                    const nextValue = await getNextValue(product.storeId, product.type)
                    item.code = generateProductCode(product.type, nextValue)
                }
                if (!instance.barCode) {
                    item.barCode = item.code
                }
                await models.ProductUnit.update({code: item.code, barCode: item.barCode}, {
                    where: {id: item.id},
                    transaction: t
                })
            }
            if (item.isBaseUnit) {
                await models.ProductUnit.update(
                    {
                        isBaseUnit: false,
                    },
                    {
                        where: {
                            id: {
                                [Op.ne]: item.id,
                            },
                            productId: id,
                            branchId: findProduct.branchId,
                            storeId: findProduct.storeId,
                        }, transaction: t
                    }
                );
            }
            updatedProductUnits.push(item.id);
        }
        if (updatedProductUnits.length) {
            await models.ProductUnit.update(
                {
                    deletedAt: new Date(),
                },
                {
                    where: {
                        id: {
                            [Op.notIn]: updatedProductUnits,
                        },
                        productId: id,
                        branchId: findProduct.branchId,
                        storeId: findProduct.storeId,
                    }, transaction: t
                }
            );
        }
    })

    createUserTracking({
        accountId: loginUser.id,
        type: accountTypes.USER,
        objectId: id,
        action: logActions.product_update.value,
        data: {id, ...product},
    });

    return {
        success: true,
    };
}

// get product detail
export async function getProductDetail(id) {
    const instance = await models.Product.findByPk(id, {
        include: productIncludes,
        attributes: productAttributes,
        raw: true,
    });
    if (!instance) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: "Không tồn tại sản phẩm",
        };
    }
    return {
        success: true,
        data: instance,
    };
}

export async function getProductBySeri(id) {
    const instance = await models.Product.findOne({
        include: productIncludes,
        attributes: productAttributes,
        where: {
            id: id
        },
    });

    if (!instance) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: "Không tồn tại sản phẩm",
        };
    }

    return {
        success: true,
        data: instance,
    };
}


export async function readProduct(id, loginUser) {
    const instance = await models.Product.findOne({
        include: productIncludes,
        attributes: productAttributes,
        where: {
            id: id,
            ...(loginUser && {storeId: loginUser.storeId}),
        },
    });

    if (!instance) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: "Không tồn tại sản phẩm",
        };
    }

    return {
        success: true,
        data: instance,
    };
}

export async function deleteProductById(id, loginUser) {
    // Chú ý xóa sản phẩm đang nằm trong chương trình chiết khấu diễn ra
    const product = await models.Product.findByPk(id, {
        attributes: ["id", "name"],
        // include: [{
        //     model: models.Combo,
        //     as: 'combos',
        //     through: {
        //         attributes: [],
        //     },
        // }],
    });

    if (!product) {
        return {
            error: true,
            id,
            code: HttpStatusCode.NOT_FOUND,
            message: "Không tồn tại sản phẩm",
        };
    }

    const {combos = []} = product;
    if (!_.isEmpty(combos)) {
        return {
            error: true,
            id,
            code: HttpStatusCode.BAD_REQUEST,
            message: "Sản phẩm đang được sử dụng ở combo, không thể xóa",
        };
    }

    // Kiểm tra trong đơn hàng
    const findOrderProduct = await models.OrderProduct.findOne({
        include: [
            {
                model: models.Order,
                as: "order",
                attributes: ["id", "status"],
                where: {
                    deletedAt: {
                        [Op.ne]: null,
                    },
                },
            },
        ],
        where: {
            // "$order.status$": {
            //   [Op.notIn]: [orderStatuses.CANCELLED, orderStatuses.SUCCEED],
            // },
            productId: product.id,
        },
    });
    if (findOrderProduct) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: "Sản phẩm đang được sử dụng ở đơn hàng, không thể xóa",
        };
    }

    // Kiểm tra phần nhập hàng
    const findProductInbound = await models.InboundToProduct.findOne({
        where: {
            productId: product.id,
        },
    });
    if (findProductInbound) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: "Sản phẩm đang được sử dụng ở nhập hàng, không thể xóa",
        };
    }

    // Kiểm tra phần trả hàng
    const findProductPurchase = await models.PurchaseReturnToProduct.findOne({
        where: {
            productId: product.id,
        },
    });
    if (findProductPurchase) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: "Sản phẩm đang được sử dụng ở nhập hàng, không thể xóa",
        };
    }

    // Kiểm tra trong đơn hàng trên chợ
    const findProductMarket = await models.MarketProduct.findOne({
        where:{
            productId:id
        }
    });

    if(findProductMarket) {
        const findProductMarketOrder = await models.MarketOrderProduct.findOne({
            where:{
                marketProductId: findProductMarket.id,
            }
        });
        if (findProductMarketOrder) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: "Sản phẩm đang được sử dụng ở hóa đơn trên chợ, không thể xóa",
            };
        }
        await models.MarketProduct.destroy({
            where:{
                productId:id
            }
        })
    }

    await Promise.all([
        models.Product.destroy({where: {id}}),
        models.ProductUnit.destroy({where: {productId: id}}),
    ]);

    createUserTracking({
        accountId: loginUser.id,
        type: accountTypes.USER,
        objectId: product.id,
        action: logActions.product_delete.value,
        data: {
            id,
            name: product.name,
            storeId: loginUser.storeId,
            branchId: loginUser.branchId,
        },
    });

    return {
        success: true,
    };
}

export async function deleteManyProducts(ids = [], loginUser) {
    const processes = [];
    ids.forEach((id) => processes.push(deleteProductById(id)));
    const results = await Promise.all(processes);
    const errors = results.filter((r) => r.error);
    if (errors && errors.length) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Không xóa được các sản phẩm có id = ${errors
                .map((e) => e.id)
                .join()}`,
        };
    }
    return {
        success: true,
    };
}

// update product status
export async function updateproductStatuses(id, product, loginUser) {
    const findProduct = await models.Product.findOne({
        attributes: ["id", "status"],
        where: {
            id,
            storeId: loginUser.storeId,
        },
    });
    if (!findProduct) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Không tồn tại sản phẩm.",
        };
    }
    await models.Product.update(product, {
        where: {
            id,
        },
    });

    createUserTracking({
        accountId: loginUser.id,
        type: accountTypes.USER,
        objectId: id,
        action: logActions.product_update.value,
        data: {id, ...product},
    });

    return {
        success: true,
    };
}

export async function updateEndDateManyProducts(
    ids = [],
    endDate,
    endMonth,
    updatedBy
) {
    let formatEndDate = null;
    if (endDate) {
        // check and format endDate
        formatEndDate = formatEndDateTime(endDate);
        if (!formatEndDate) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Sai định dạng thời gian`,
            };
        }
    }
    ids = _.uniq(ids);
    if (ids.length == 0) {
        return {
            success: true,
        };
    }
    let dataUpdate = {
        updatedBy,
        endDate: formatEndDate,
        endMonth: endMonth,
    };
    if (endDate === "") {
        delete dataUpdate.endDate;
    }
    if (endMonth === "") {
        delete dataUpdate.endMonth;
    }
    await models.Product.update(dataUpdate, {
        where: {
            id: {
                [Op.in]: ids,
            },
        },
    });
    return {
        success: true,
    };
}

export async function hashProductPrice(params) {
    const {loginCustomer = {}} = params;
    try {
        const customerId = loginCustomer.id;
        if (
            !customerId ||
            !(
                loginCustomer.position === customerType.Company ||
                loginCustomer.position === customerType.Pharmacy ||
                loginCustomer.position === customerType.Clinic
            ) ||
            loginCustomer.status !== customerStatus.ACTIVE
        ) {
            return {};
        }

        const currentTime = moment();

        const promotionToCustomer = (
            await promotionProgramToCustomerFilter({
                customerId,
                time: currentTime,
            })
        ).map((o) => o.promotionId);

        const promotions = [...new Set(promotionToCustomer)];

        if (!promotions.length) {
            return {};
        }

        const products = (
            await promotionProgramToProductFilter({
                promotionId: promotions,
            })
        ).map((o) => o.productId);

        if (!products.length) {
            return {};
        }

        const productPriceToCustomer = {};
        const productPrice = await productToCustomerPercentDiscountFilter({
            customerId,
            productId: products,
            time: currentTime,
        });

        for (let item of productPrice) {
            if (productPriceToCustomer[item.productId]) continue;
            productPriceToCustomer[item.productId] = item.percentDiscount;
        }

        return productPriceToCustomer;
    } catch (e) {
        console.log(e);
        return {};
    }
}

/*
    Xác định 2 loại giá:
    KH thường: 
        + Giá bán lẻ đề xuất 
    KH vip: 
        + Giá gốc 
        + Giảm giá or giá chiết khấu 
    Note: Giá bán lẻ đề xuất > Giá gốc  > Giảm giá or giá chiết khấu 
*/
export async function extractFieldProduct(
    products,
    hashPrice,
    loginCustomer = {}
) {
    try {
        let items = [];
        for (let item of products) {
            // if (
            //   loginCustomer.status === customerStatus.ACTIVE &&
            //   (loginCustomer.position === customerType.Company ||
            //     loginCustomer.position === customerType.Pharmacy ||
            //     loginCustomer.position === customerType.Clinic)
            // ) {
            //   if (hashPrice[item.dataValues.id]) {
            //     item.dataValues.price =
            //       Math.round(
            //         (+item.dataValues.cost -
            //           +item.dataValues.cost *
            //             (+hashPrice[item.dataValues.id] / 100)) /
            //           1000,
            //         2
            //       ) * 1000;
            //     item.dataValues.percentDiscount = +hashPrice[item.dataValues.id];
            //   } else {
            //     item.dataValues.price = item.dataValues.discountPrice
            //       ? +item.dataValues.discountPrice
            //       : +item.dataValues.cost;
            //     item.dataValues.percentDiscount = 0;
            //   }
            // } else {
            //   item.dataValues.price = +item.dataValues.cost;
            //   item.dataValues.retailPrice = null;
            //   item.dataValues.percentDiscount = 0;
            //   item.dataValues.cost = null;
            // }
            item.dataValues.price = +item.dataValues.cost;
            item.dataValues.retailPrice = null;
            item.dataValues.percentDiscount = 0;
            item.dataValues.cost = null;
            delete item.dataValues.discountPrice;
            items.push(item.dataValues);
        }
        return items;
    } catch (e) {
        console.log("PRICE ===================>", e);
        return [];
    }
}

export async function randomProducts(params) {
    const {limit = 24, notEqualId} = params;
    const where = {};
    if (notEqualId) {
        where.id = {
            [Op.ne]: notEqualId,
        };
    }
    const products = (
        await models.Product.findAll({
            attributes: ["id"],
            where,
            raw: true,
        })
    ).map((o) => o.id);
    const arr = [];
    for (let i = 0; i < +limit; i++) {
        let index = Math.floor(Math.random() * products.length);
        if (arr.indexOf(products[index]) === -1) arr.push(products[index]);
    }

    return arr;
}

export async function indexInventory(id, storeId, branchId, productUnitId) {
    let where = {productId: id};
    if (branchId) {
        where.branchId = branchId;
    }
    const inventories = await models.Inventory.findAll({
        where,
        attributes: ["id", "quantity", "productId", "branchId"],
        include: [
            {
                model: models.Branch,
                as: "branch",
                attributes: ["id", "name", "code"]
            }
        ]
    });
    if (productUnitId) {
        const productUnit = await models.ProductUnit.findOne({
            where: {
                id: productUnitId
            }
        });
        inventories[0].dataValues.quantityProductUnit = parseInt(Math.floor(inventories[0].quantity / productUnit.exchangeValue));
    }
    const marketProduct = await models.MarketProduct.findOne({
        where:{
            productId: id
        }
    });
    if(marketProduct){
        // Tính số lượng khách hàng đặt
        const totalProduct = await models.MarketOrderProduct.count({
            where:{
                marketProductId:marketProduct.id
            },
            include:[{
                model:models.MarketOrder,
                as:"marketOrder",
                where:{
                    [Op.or]:[
                        {status:STATUS_ORDER.PENDING,},
                        {status:STATUS_ORDER.CONFIRM}
                    ]
                }
            }]
        });
        inventories[0].dataValues.customerOrders = totalProduct;
        // Dự kiến hết hàng
        const timeBuy = now.diff(moment(marketProduct.createdAt), 'days');
        inventories[0].dataValues.stockout = parseInt(+timeBuy * +inventories[0].quantity /+totalProduct);

    }
    else{
        inventories[0].dataValues.customerOrders = 0;
        inventories[0].dataValues.stockout = 0;
    }
    return {
        success: true,
        data: inventories
    }
}

export async function getProduct(id) {
    const product = await models.Product.findOne({
        where: {
            id: id
        }
    })
    if (!product) {
        raiseBadRequestError("Không tìm thấy sản phẩm")
    }
    return product
}

export async function findProduct(keyword, page, limit) {
    const where = {}
    if (keyword) {
        where[Op.or] = {
            name: {
                [Op.like]: `%${keyword.trim()}%`,
            },
            slug: {
                [Op.like]: `%${keyword.trim()}%`,
            },
            code: {
                [Op.like]: `%${keyword.trim()}%`,
            },
        };
    }

    return await models.Product.findAll({
        where: where,
        offset: +limit * (+page - 1),
        limit: +limit,
        order: [["id", "DESC"]],
    })
}

export async function uploadFileService(loginUser, data, branchId) {
    for (let index = 0; index < data.length; index++) {
        const item = data[index];
        try {
            let listUnit = [];
            _.forEach(item, (value, key) => {
                if (_.startsWith(key, 'Đơn vị')) {
                    const index = key.split(' ')[2];
                    if (!isNaN(index)) {
                        if (item[`Đơn vị ${index}`]) {
                            listUnit.push({
                                [`unitName`]: item[`Đơn vị ${index}`],
                                [`exchangeValue`]: item[`Quy đổi ${index}`],
                                [`price`]: item[`Giá bán ${index}`],
                                [`code`]: item[`Mã hàng ${index}`],
                                [`barCode`]: item[`Mã vạch ${index}`],
                                [`isDirectSale`]: false,
                                [`isBaseUnit`]: false,
                                [`Điểm`]: item[`Điểm ${index}`]
                            });
                        }
                    }
                }
            });
            listUnit.push({
                [`unitName`]: item[`Đơn vị cơ bản`.trim()],
                [`exchangeValue`]: 1,
                [`price`]: item[`Giá bán`.trim()],
                [`code`]: item[`Mã hàng`.trim()],
                [`barCode`]: item[`Mã vạch`.trim()],
                [`isDirectSale`]: item[`Bán trực tiếp`],
                [`isBaseUnit`]: true,
                [`Điểm`]: item[`Điểm`.trim()]
            });
            let result = {
                type: parseInt(_.get(item, 'Loại sản phẩm', 2).toString().trim()),
                code: _.get(item, 'Mã hàng', '').toString().trim(),
                barCode: _.get(item, 'Mã vạch', '').toString().trim(),
                drugCode: _.get(item, 'Mã thuốc', '').toString().trim(),
                name: _.get(item, 'Tên sản phẩm', null) ? _.get(item, 'Tên sản phẩm', null).toString().trim() : null,
                shortName: _.get(item, 'Tên viết tắt', '').toString().trim(),
                groupProductName: _.get(item, 'Nhóm sản phẩm', null) ? _.get(item, 'Nhóm sản phẩm', null).toString().trim() : null,
                positionName: _.get(item, 'Vị trí', null) ? _.get(item, 'Vị trí', null).toString().trim() : null,
                dosageName: _.get(item, 'Đường dùng', null) ? _.get(item, 'Đường dùng', null).toString().trim() : null,
                primePrice: _.get(item, 'Giá vốn', 0),
                price: _.get(item, 'Giá bán', 0),
                weight: _.get(item, 'Trọng lượng', 0),
                packingSpecification: _.get(item, 'Quy cách đóng gói', null) ? _.get(item, 'Quy cách đóng gói', null).toString().trim() : null,
                manufactureName: _.get(item, 'Hãng sản xuất', null) ? _.get(item, 'Hãng sản xuất', null).toString().trim() : null,
                countryName: _.get(item, 'Nước sản xuất', null) ? _.get(item, 'Nước sản xuất', null).toString().trim() : null,
                inventory: _.get(item, 'Tồn kho', 0),
                isBatchExpireControl: _.get(item, 'Có lô không', false),
                expiryPeriod: _.get(item, 'Cảnh báo ngày hết hạn', null) ? _.get(item, 'Cảnh báo ngày hết hạn', null).toString().trim() : null,
                isDirectSale: _.get(item, 'Bán trực tiếp', true),
                baseUnit: _.get(item, 'Đơn vị cơ bản', null) ? _.get(item, 'Đơn vị cơ bản', null).toString().trim() : null,
                isLoyaltyPoint: _.get(item, 'Tích điểm không', true),
                minInventory: _.get(item, 'Tồn ít nhất', 0),
                maxInventory: _.get(item, 'Tồn nhiều nhất', 999),
                description: _.get(item, 'Mô tả', null) ? _.get(item, 'Mô tả', null).toString().trim() : null,
                note: _.get(item, 'Ghi chú', null) ? _.get(item, 'Ghi chú', null).toString().trim() : null,
                image: _.get(item, 'Hình ảnh', null) ? _.get(item, 'Hình ảnh', null).toString().trim() : null,
                listUnit: listUnit
            }

            let newProduct;
            let product;
            await models.sequelize.transaction(async (t) => {
                let groupProduct = {}, manufacture = {}, country = {}, dosage = {}, position = {};
                if (result.groupProductName) {
                    [groupProduct] = await models.GroupProduct.findOrCreate({
                        where: {
                            name: {[Op.like]: `%${result.groupProductName}`},
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.groupProductName,
                            createdBy: loginUser.id
                        },
                        transaction: t
                    });
                }
                if (result.manufactureName) {
                    [manufacture] = await models.Manufacture.findOrCreate({
                        where: {
                            name: {
                                [Op.like]: `%${result.manufactureName}`
                            },
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.manufactureName,
                            storeId: loginUser.storeId
                        },
                        transaction: t
                    });
                }
                if (result.countryName) {
                    country = await models.CountryProduce.findOne({
                        where: {
                            name: {[Op.like]: `%${result.countryName}%`}
                        }
                    });
                }
                if (result.dosageName) {
                    [dosage] = await models.Dosage.findOrCreate({
                        where: {
                            name: {[Op.like]: `%${result.dosageName}%`},
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.dosageName,
                            storeId: loginUser.storeId,
                            createdBy: loginUser.id
                        },
                        transaction: t
                    });
                }
                if (result.positionName) {
                    [position] = await models.Position.findOrCreate({
                        where: {
                            name: {[Op.like]: `%${result.positionName}%`},
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.positionName,
                            storeId: loginUser.storeId,
                            createdBy: loginUser.id
                        },
                        transaction: t
                    })
                }
                product = {
                    name: result.name,
                    slug: result.slug || "",
                    drugCode: result.drugCode,
                    code: result.code,
                    barCode: result.barCode,
                    shortName: result.shortName,
                    groupProductId: groupProduct.id,
                    primePrice: result.primePrice,
                    price: result.price,
                    weight: result.weight,
                    warningExpiryDate: result.warningExpiryDate,
                    warningExpiryText: result.warningExpiryText,
                    isDirectSale: result.isDirectSale,
                    packingSpecification: result.packingSpecification,
                    manufactureId: manufacture.id,
                    countryId: country.id,
                    minInventory: result.minInventory,
                    maxInventory: result.maxInventory,
                    description: result.description,
                    note: result.note,
                    status: productStatuses.ACTIVE,
                    //imageId: _.get(req.body, "imageId", null),
                    type: result.type,
                    storeId: loginUser.storeId,
                    branchId: branchId,
                    dosageId: dosage.id,
                    positionId: position.id,
                    isLoyaltyPoint: result.isLoyaltyPoint,
                    isBatchExpireControl: result.isBatchExpireControl,
                    expiryPeriod: result.expiryPeriod,
                    inventory: result.inventory,
                    baseUnit: result.baseUnit,
                    productUnits: result.listUnit,
                    createdBy: loginUser.id,
                    createdAt: new Date(),
                };
                if (product.code) {
                    const checkUniqueCode = await checkUniqueValue("Product", {
                        code: product.code,
                        branchId: product.branchId,
                        storeId: product.storeId,
                    });
                    throw new Error(`Mã hàng ${product.code} đã tồn tại.`)
                }
                if (product.barCode) {
                    product.barCode = removeDiacritics(product.barCode);
                    const checkUniqueBarCode = await checkUniqueValue("Product", {
                        barCode: product.barCode,
                        storeId: product.storeId,
                    });
                    if (!checkUniqueBarCode) {
                        throw new Error(`Mã vạch ${product.barCode} đã tồn tại.`);
                    }
                }
                newProduct = await models.Product.create({
                    ...product,
                    ...(product.type === productTypeCharacters.THUOC && {
                        isBatchExpireControl: true,
                    }),
                }, {transaction: t});
                await newInventory(product.branchId, newProduct.id, product.inventory, t);
                let newInventoryCheking;
                if (product.inventory && product.isBatchExpireControl == false) {
                    newInventoryCheking = await models.InventoryChecking.create({
                        userCreateId: product.createdBy,
                        branchId: product.branchId
                    }, {
                        transaction: t
                    });
                    await models.InventoryChecking.update({
                        code: generateCode.generateCode("KK", newInventoryCheking.id)
                    }, {
                        where: {
                            id: newInventoryCheking.id
                        },
                        transaction: t
                    });

                    await createWarehouseCard({
                        code: generateCode.generateCode("KK", newInventoryCheking.id),
                        type: warehouseStatus.ADJUSTMENT,
                        partner: "",
                        productId: newProduct.id,
                        branchId: product.branchId,
                        changeQty: product.inventory,
                        remainQty: product.inventory,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }, t);
                }
                if (!product.code) {
                    const nextValue = await getNextValue(product.storeId, product.type)
                    const code = generateProductCode(product.type, nextValue)
                    product.code = code
                    if (!product.barCode) {
                        product.barCode = code
                    }
                    await models.Product.update(
                        {code: code, barCode: product.barCode},
                        {where: {id: newProduct.id}, transaction: t}
                    );
                }

                // add product units
                const productUnits = _.get(product, "productUnits", []).map((item) => ({
                    productId: newProduct.id,
                    unitName: item.unitName,
                    exchangeValue: item.exchangeValue,
                    price: item.price,
                    isDirectSale: item.isDirectSale || false,
                    isBaseUnit: item.isBaseUnit || false,
                    quantity: item.quantity || 0,
                    code: item.code || item.code,
                    barCode: item.barCode || "",
                    point: item.point || 0,
                    storeId: product.storeId,
                    createdBy: loginUser.id,
                }));
                for (const productUnit of productUnits) {
                    if (productUnit.isBaseUnit) {
                        productUnit.code = product.code
                        productUnit.barCode = product.barCode
                    } else {
                        if (!productUnit.code) {
                            const nextValue = await getNextValue(product.storeId, product.type)
                            productUnit.code = generateProductCode(product.type, nextValue)
                            if (!productUnit.barCode) {
                                productUnit.barCode = productUnit.code
                            }
                        }
                    }
                }
                for (const productUnit of productUnits) {
                    const newProductUnit = await models.ProductUnit.create(productUnit, {
                        transaction: t
                    });
                    if (newProductUnit.isBaseUnit == true && product.inventory && product.isBatchExpireControl == 0) {
                        await models.InventoryCheckingProduct.create({
                            inventoryCheckingId: newInventoryCheking.id,
                            productUnitId: newProductUnit.id,
                            realQuantity: product.inventory,
                            difference: product.inventory
                        }, {
                            transaction: t
                        })
                    }
                }
            });
            createUserTracking({
                accountId: loginUser.id,
                type: accountTypes.USER,
                objectId: newProduct.id,
                action: logActions.product_create.value,
                data: product,
            });
        } catch (error) {
            return {
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Lỗi ${error}`
            }
        }
    }
    return {
        success: true,
        data: null
    }
}

export async function uploadFileKiotVietService(loginUser, data, branchId) {
    try {
        const t = await models.sequelize.transaction(async (t) => {
            let listProductUnit = [];
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                let result = {
                    type: _.get(item, 'Loại hàng', 'Hàng hóa').toString().trim(),
                    code: _.get(item, 'Mã hàng', '').toString().trim(),
                    barCode: _.get(item, 'Mã vạch', '').toString().trim(),
                    drugCode: _.get(item, 'Mã thuốc', '').toString().trim(),
                    name: _.get(item, 'Tên hàng', null) ? _.get(item, 'Tên hàng', null).toString().trim() : null,
                    shortName: _.get(item, 'Tên viết tắt', '').toString().trim(),
                    groupProductName: _.get(item, 'Nhóm hàng(3 Cấp)', null) ? _.get(item, 'Nhóm hàng(3 Cấp)', null).toString().trim() : null,
                    positionName: _.get(item, 'Vị trí', null) ? _.get(item, 'Vị trí', null).toString().trim() : null,
                    dosageName: _.get(item, 'Đường dùng', null) ? _.get(item, 'Đường dùng', null).toString().trim() : null,
                    primePrice: _.get(item, 'Giá vốn', 0),
                    price: _.get(item, 'Giá bán', 0),
                    weight: _.get(item, 'Trọng lượng', 0),
                    packingSpecification: _.get(item, 'Quy cách đóng gói', null) ? _.get(item, 'Quy cách đóng gói', null).toString().trim() : null,
                    manufactureName: _.get(item, 'Hãng sản xuất', null) ? _.get(item, 'Hãng sản xuất', null).toString().trim() : null,
                    countryName: _.get(item, 'Nước sản xuất', null) ? _.get(item, 'Nước sản xuất', null).toString().trim() : null,
                    inventory: _.get(item, 'Tồn kho', 0),
                    isBatchExpireControl: _.get(item, 'Quản lý lô-hạn sử dụng', 0),
                    expiryPeriod: _.get(item, 'Cảnh báo ngày hết hạn', null) ? _.get(item, 'Cảnh báo ngày hết hạn', null).toString().trim() : null,
                    isDirectSale: _.get(item, 'Được bán trực tiếp', true),
                    isLoyaltyPoint: _.get(item, 'Tích điểm', true),
                    minInventory: _.get(item, 'Tồn nhỏ nhất', 0),
                    maxInventory: _.get(item, 'Tồn lớn nhất', 999),
                    description: _.get(item, 'Mô tả', null) ? _.get(item, 'Mô tả', null).toString().trim() : null,
                    note: _.get(item, 'Ghi chú', null) ? _.get(item, 'Ghi chú', null).toString().trim() : null,
                    unit: _.get(item, 'ĐVT', '').toString().trim(),
                    exchangeValue: _.get(item, 'Quy đổi', null).toString().trim(),
                    image: _.get(item, 'Hình ảnh (url1,url2...)', '').toString().trim(),
                    status: _.get(item, 'Đang kinh doanh', 1).toString().trim(),
                    codeBaseUnit: _.get(item, 'Mã ĐVT Cơ bản', '').toString().trim()
                }

                let listInventory = [];
                if (result.codeBaseUnit === "") {
                    _.forEach(item, (value, key) => {
                        if (_.startsWith(key, 'Lô')) {
                            const index = key.split(' ')[1];
                            if (!isNaN(index)) {
                                if (item[`Lô ${index}`]) {
                                    listInventory.push({
                                        [`name`]: item[`Lô ${index}`],
                                        [`quantity`]: item[`Tồn ${index}`],
                                        [`expiryDate`]: item[`Hạn sử dụng ${index}`]
                                    });
                                }
                            }
                        }
                    });
                }
                let newProduct;
                let product;
                let groupProduct = {}, manufacture = {}, country = {}, dosage = {}, position = {};
                if (result.groupProductName) {
                    [groupProduct] = await models.GroupProduct.findOrCreate({
                        where: {
                            name: {[Op.like]: `%${result.groupProductName}`},
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.groupProductName,
                            createdBy: loginUser.id
                        },
                        transaction: t
                    });
                }
                if (result.manufactureName) {
                    [manufacture] = await models.Manufacture.findOrCreate({
                        where: {
                            name: {
                                [Op.like]: `%${result.manufactureName}`
                            },
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.manufactureName,
                            storeId: loginUser.storeId
                        },
                        transaction: t
                    });
                }
                if (result.countryName) {
                    country = await models.CountryProduce.findOne({
                        where: {
                            name: {[Op.like]: `%${result.countryName}%`}
                        }
                    });
                }
                if (result.dosageName) {
                    [dosage] = await models.Dosage.findOrCreate({
                        where: {
                            name: {[Op.like]: `%${result.dosageName}%`},
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.dosageName,
                            storeId: loginUser.storeId,
                            createdBy: loginUser.id
                        },
                        transaction: t
                    });
                }
                if (result.positionName) {
                    [position] = await models.Position.findOrCreate({
                        where: {
                            name: {[Op.like]: `%${result.positionName}%`},
                            storeId: loginUser.storeId
                        },
                        defaults: {
                            name: result.positionName,
                            storeId: loginUser.storeId,
                            createdBy: loginUser.id
                        },
                        transaction: t
                    })
                }
                if(result.type === 'Hàng hóa'){
                    result.type = 2;
                }
                else if(result.type === 'Thuốc'){
                    result.type = 1;
                }else{
                    result.type = 3;
                }
                if (result.codeBaseUnit === '') {
                    product = {
                        name: result.name,
                        slug: result.slug || "",
                        drugCode: result.drugCode,
                        code: result.code,
                        barCode: result.barCode,
                        shortName: result.shortName,
                        groupProductId: groupProduct.id,
                        primePrice: result.primePrice,
                        price: result.price,
                        weight: result.weight,
                        warningExpiryDate: result.warningExpiryDate,
                        warningExpiryText: result.warningExpiryText,
                        isDirectSale: result.isDirectSale,
                        packingSpecification: result.packingSpecification,
                        manufactureId: manufacture.id,
                        countryId: country.id,
                        minInventory: result.minInventory,
                        maxInventory: result.maxInventory,
                        description: result.description,
                        note: result.note,
                        status: productStatuses.ACTIVE,
                        imageUrl: result.image,
                        type: result.type,
                        storeId: loginUser.storeId,
                        branchId: branchId,
                        dosageId: dosage.id,
                        positionId: position.id,
                        isLoyaltyPoint: result.isLoyaltyPoint,
                        isBatchExpireControl: result.isBatchExpireControl,
                        expiryPeriod: result.expiryPeriod,
                        inventory: result.inventory,
                        baseUnit: result.unit,
                        createdBy: loginUser.id,
                        createdAt: new Date(),
                    };
                    if (product.code) {
                        const checkUniqueCode = await checkUniqueValue("Product", {
                            code: product.code,
                            branchId: product.branchId,
                            storeId: product.storeId,
                        });
                        if (!checkUniqueCode) {
                            throw new Error(`Mã hàng ${product.code} đã tồn tại.`)
                        }
                    }
                    if (product.barCode) {
                        product.barCode = removeDiacritics(product.barCode);
                        const checkUniqueBarCode = await checkUniqueValue("Product", {
                            barCode: product.barCode,
                            storeId: product.storeId,
                        });
                        if (!checkUniqueBarCode) {
                            throw new Error(`Mã vạch ${product.barCode} đã tồn tại.`);
                        }
                    }
                    newProduct = await models.Product.create({
                        ...product,
                        ...(product.type === productTypeCharacters.THUOC && {
                            isBatchExpireControl: true,
                        }),
                    }, {transaction: t});
                    await newInventory(product.branchId, newProduct.id, product.inventory, t);
                    let newInventoryCheking;
                    if (product.inventory && product.isBatchExpireControl == false) {
                        newInventoryCheking = await models.InventoryChecking.create({
                            userCreateId: product.createdBy,
                            branchId: product.branchId
                        }, {
                            transaction: t
                        });
                        await models.InventoryChecking.update({
                            code: generateCode.generateCode("KK", newInventoryCheking.id)
                        }, {
                            where: {
                                id: newInventoryCheking.id
                            },
                            transaction: t
                        });

                        await createWarehouseCard({
                            code: generateCode.generateCode("KK", newInventoryCheking.id),
                            type: warehouseStatus.ADJUSTMENT,
                            partner: "",
                            productId: newProduct.id,
                            branchId: product.branchId,
                            changeQty: product.inventory,
                            remainQty: product.inventory,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }, t);
                    }
                    if (!product.code) {
                        const nextValue = await getNextValue(product.storeId, product.type)
                        const code = generateProductCode(product.type, nextValue)
                        product.code = code
                        if (!product.barCode) {
                            product.barCode = code
                        }
                        await models.Product.update(
                            {code: code, barCode: product.barCode},
                            {where: {id: newProduct.id}, transaction: t}
                        );
                    }

                    // add product units
                    const productUnit = {
                        productId: newProduct.id,
                        unitName: result.unit,
                        exchangeValue: result.exchangeValue,
                        price: result.price,
                        isDirectSale: result.isDirectSale || false,
                        isBaseUnit: true,
                        quantity: result.quantity || 0,
                        code: product.code,
                        barCode: product.barCode || "",
                        point: result.point || 0,
                        storeId: product.storeId,
                        createdBy: loginUser.id,
                    };

                    const newProductUnit = await models.ProductUnit.create(productUnit, {
                        transaction: t
                    });
                    if (newProductUnit.isBaseUnit == true && product.inventory && product.isBatchExpireControl == 0) {
                        await models.InventoryCheckingProduct.create({
                            inventoryCheckingId: newInventoryCheking.id,
                            productUnitId: newProductUnit.id,
                            realQuantity: product.inventory,
                            difference: product.inventory
                        }, {
                            transaction: t
                        })
                    }

                    //Thêm batches
                    if (result.isBatchExpireControl) {
                        for (const batch of listInventory) {
                            const newBatch = await models.Batch.create({
                                storeId: loginUser.storeId,
                                branchId: parseInt(branchId),
                                productId: newProduct.id,
                                name: batch.name,
                                expiryDate: formatExcelDate(batch.expiryDate),
                                quantity: batch.quantity,
                                oldQuantity: batch.quantity,
                                createdBy: loginUser.id,
                                updatedBy: loginUser.id
                            }, {
                                transaction: t
                            });
                        }
                    }

                    createUserTracking({
                        accountId: loginUser.id,
                        type: accountTypes.USER,
                        objectId: newProduct.id,
                        action: logActions.product_create.value,
                        data: product,
                    });

                    //Thêm productUnit
                    if(listProductUnit.length>0){
                        for(let item of listProductUnit){
                            const newProduct = await models.Product.findOne({
                                where: {
                                    code: item.codeBaseUnit,
                                    storeId: loginUser.storeId
                                },
                                transaction: t
                            });
                            const productUnit = {
                                productId: newProduct.id,
                                unitName: item.unit,
                                exchangeValue: item.exchangeValue,
                                price: item.price,
                                isDirectSale: item.isDirectSale || false,
                                isBaseUnit: true,
                                quantity: item.quantity || 0,
                                code: item.code,
                                barCode: item.barCode || "",
                                point: item.point || 0,
                                storeId: loginUser.storeId,
                                createdBy: loginUser.id,
                            };

                            if (!item.code) {
                                const nextValue = await getNextValue(item.storeId, item.type)
                                item.code = generateProductCode(item.type, nextValue)
                                if (!item.barCode) {
                                    item.barCode = item.code
                                }
                            }
                            await models.ProductUnit.create(productUnit, {
                                transaction: t
                            });
                        }
                    }
                    listProductUnit = [];
                } else {
                    const newProduct = await models.Product.findOne({
                        where: {
                            code: result.codeBaseUnit,
                            storeId: loginUser.storeId
                        },
                        transaction: t
                    });
                    if(!newProduct){
                        listProductUnit.push(result);
                    }
                    else {
                        const productUnit = {
                            productId: newProduct.id,
                            unitName: result.unit,
                            exchangeValue: result.exchangeValue,
                            price: result.price,
                            isDirectSale: result.isDirectSale || false,
                            isBaseUnit: true,
                            quantity: result.quantity || 0,
                            code: result.code,
                            barCode: result.barCode || "",
                            point: result.point || 0,
                            storeId: loginUser.storeId,
                            createdBy: loginUser.id,
                        };

                        if (!result.code) {
                            const nextValue = await getNextValue(result.storeId, result.type)
                            result.code = generateProductCode(result.type, nextValue)
                            if (!result.barCode) {
                                result.barCode = result.code
                            }
                        }
                        await models.ProductUnit.create(productUnit, {
                            transaction: t
                        });
                    }
                }
            }
        });
    } catch (error) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Lỗi ${error}`
        }
    }
    return {
        success: true,
        data: null
    }
}