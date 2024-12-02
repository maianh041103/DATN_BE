import { moveAttributes, moveInclude, moveStatus } from "./constant";
import { generateCode } from "../../helpers/codeGenerator";
import { getProductUnit } from "../product/productUnitService";
import { addInventory, getInventory } from "../inventory/inventoryService";
import { raiseBadRequestError } from "../../helpers/exception";
import { getProduct } from "../product/productService";
import { createWarehouseCard } from "../warehouse/warehouseService";
import { warehouseStatus } from "../warehouse/constant";
import { addBatchQty, getBatch, getOrCreateBatch } from "../batch/batchService";
import { getFilter } from "./filter";
import {HttpStatusCode} from "../../helpers/errorCodes";
const _ = require("lodash");
const userLogContant = require("../userLog/userLogContant");

const models = require("../../../database/models");
export async function indexList(params, loginUser) {
    const filter = getFilter(params, loginUser)
    const { limit, page } = params;
    const [moves, count] = await Promise.all([
        models.Move.findAll({
            attributes: moveAttributes,
            include: moveInclude,
            ...filter,
            offset: +limit * (+page - 1),
            limit: +limit,
            order: [["id", "desc"]]
        }),
        models.Move.count(filter)
    ])
    return {
        success: true,
        data: {
            items: moves,
            totalItem: count,
        },
    };
}


export async function indexCreate(moveReq, loginUser) {
    let move;
    await models.sequelize.transaction(async (t) => {
        move = await createMove(moveReq, t)
        const moveItems = await createMoveItem(move, moveReq.products, loginUser, t)
    })
    return {
        success: true,
        data: move
    }
}

async function createMove(moveReq, transaction) {
    const products = moveReq.products || [];
    let totalPrice = 0;
    for (const product of products) {
        totalPrice += product.price * product.quantity;
    }
    const move = await models.Move.create({
        storeId: moveReq.storeId,
        fromBranchId: moveReq.fromBranchId,
        toBranchId: moveReq.toBranchId,
        movedAt: new Date(),
        movedBy: moveReq.movedBy,
        status: moveStatus.MOVING,
        note: moveReq.note,
        totalItem: moveReq.totalItem,
        totalPrice: totalPrice
    },
        { transaction: transaction }
    )
    move.code = moveReq.code || generateCode("MV", move.id)
    await models.Move.update({ code: move.code },
        { where: { id: move.id }, transaction: transaction })

    await models.UserLog.create({
        userId: moveReq.movedBy,
        type: userLogContant.TYPE.MOVE,
        amount: totalPrice,
        branchId: moveReq.fromBranchId,
        code: move.dataValues.code
    }, {
        transaction: transaction
    });

    await models.UserLog.create({
        userId: moveReq.movedBy,
        type: userLogContant.TYPE.MOVE,
        amount: totalPrice,
        branchId: moveReq.toBranchId,
        code: move.dataValues.code
    }, {
        transaction: transaction
    })

    return move
}

async function createMoveItem(move, productsReq, loginUser, t) {
    for (const item of productsReq) {
        const productUnit = await getProductUnit(item.productUnitId)
        const product = await getProduct(item.productId)
        const inventory = await getInventory(move.fromBranchId, item.productId)
        const totalQuantity = item.quantity * productUnit.exchangeValue
        if (inventory < totalQuantity) {
            raiseBadRequestError(`Sản phẩm ${product.name} không đủ số lượng để chuyển`)
        }
        const moveItem = await models.MoveItem.create({
            moveId: move.id,
            productUnitId: item.productUnitId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }, { transaction: t })

        await createWarehouseCard({
            code: move.code,
            type: warehouseStatus.MOVE,
            partner: "",
            productId: item.productId,
            branchId: move.fromBranchId,
            changeQty: parseInt(-totalQuantity),
            remainQty: +inventory - +totalQuantity,
            createdAt: new Date(),
            updatedAt: new Date()
        }, t)
        await addInventory(move.fromBranchId, item.productId, -totalQuantity, t)
        if (product.isBatchExpireControl) {
            if (!item.batches) {
                raiseBadRequestError("Lô hàng không được để trống")
            }
            for (const batchReq of item.batches) {
                console.log(batchReq)
                const batch = await getBatch(batchReq.id)
                if (batch.quantity < batchReq.quantity * productUnit.exchangeValue) {
                    raiseBadRequestError(`Lô sản phẩm ${batch.name} không đủ số lượng`)
                }
                await models.MoveItemBatch.create({
                    moveItemId: moveItem.id,
                    fromBatchId: batchReq.id,
                    quantity: batchReq.quantity
                }, { transaction: t })
                await addBatchQty(batchReq.id, -batchReq.quantity * productUnit.exchangeValue, t)
                const toBatch = await getOrCreateBatch(loginUser.storeId, move.toBranchId, product.id, batch.name, batch.expiryDate)
                await models.MoveItemToBatch.create({
                    moveItemId: moveItem.id,
                    toBatchId: toBatch.id,
                    quantity: 0
                }, { transaction: t })
            }
        }

    }
}

export async function readMove(id, loginUser) {
    return {
        success: true,
        data: await getDetail(id)
    }
}

export async function getDetail(id) {
    const move = await models.Move.findByPk(id, {
        attributes: moveAttributes,
        include: moveInclude,
    })
    if (!move) {
        raiseBadRequestError("Không tìm thấy phiếu chuyển haàng")
    }
    for(let item of move.items){
        item.dataValues.product.dataValues.quantity = parseInt(await getInventory(move.toBranchId, item.product.id));
    }
    return move;
}

export async function getMoveItem(id) {
    const moveItem = await models.MoveItem.findByPk(id,
        {
            attributes: ['id', 'quantity', 'productId','toQuantity'],
            include: [
                {
                    model: models.ProductUnit,
                    as: 'productUnit',
                    attributes: ['id', 'unitName', 'exchangeValue'],
                },
            ]
        })
    if (!moveItem) {
        raiseBadRequestError("Sản phẩm không tồn tại")
    }
    return moveItem
}
export async function receiveMove(id, payload, loginUser) {
    const { branchId, receivedBy, items, note } = payload
    const move = await getDetail(id)
    if (branchId !== move.toBranchId) {
        raiseBadRequestError("Chi nhánh không phù hợp để nhận hàng")
    }
    if (move.status === 'RECEIVED') {
        return{
            error:true,
            message:"Đã nhận được hàng",
            code: HttpStatusCode.BAD_REQUEST
        }
    }
    await models.sequelize.transaction(async (t) => {
        let checkReceived = true;
        for (const item of items) {
            const moveItem = await getMoveItem(item.id);
            if(item.totalQuantity + moveItem.toQuantity > moveItem.quantity){
                throw new Error("Bạn đã nhận quá số lượng chuyển");
            }
            if(item.totalQuantity + moveItem.toQuantity !== moveItem.quantity){
                checkReceived = false;
            }
            await models.MoveItem.update({
                toQuantity: item.totalQuantity + (moveItem.toQuantity || 0)
            }, { where: { id: moveItem.id }, transaction: t });
            const exchangeValue = moveItem.productUnit.exchangeValue;
            const totalQuantity = item.totalQuantity * exchangeValue
            await createWarehouseCard({
                code: move.code,
                type: warehouseStatus.MOVE_RECEIVE,
                partner: move.fromBranch.name,
                productId: moveItem.productId,
                branchId: move.toBranchId,
                changeQty: +totalQuantity,
                remainQty: parseInt(await getInventory(move.toBranchId, moveItem.productId)) + +totalQuantity,
                createdAt: new Date(),
                updatedAt: new Date()
            }, t)
            await addInventory(move.toBranchId, moveItem.productId, totalQuantity, t)
            if (item.batches) {
                for (const batchReq of item.batches) {
                    await models.MoveItemToBatch.update({
                        quantity: batchReq.quantity
                    }, {
                        where: {
                            moveItemId: moveItem.id,
                            toBatchId: batchReq.id
                        }, transaction: t
                    })
                    // await models.MoveItemToBatch.create({
                    //     moveItemId: moveItem.id,
                    //     fromBatchId: batchReq.id,
                    //     quantity: batchReq.quantity
                    // }, {transaction: t})
                    await addBatchQty(batchReq.id, batchReq.quantity * exchangeValue, t)
                }
            }
        }

        if(checkReceived === true){
            await models.Move.update({
                receivedBy: receivedBy,
                receivedAt: new Date(),
                receiveNote: note,
                status: moveStatus.RECEIVED
            }, {
                where: { id: id }, transaction: t
            });
        }
        const amount = (await models.Move.findOne({
            where: {
                id: id
            }
        })).totalPrice;
        await models.UserLog.create({
            userId: receivedBy,
            code: move.code,
            type: userLogContant.TYPE.RECEIVE,
            branchId,
            amount
        })
        await models.UserLog.create({
            userId: receivedBy,
            code: move.code,
            type: userLogContant.TYPE.RECEIVE,
            branchId: move.fromBranchId,
            amount
        });
    })
    return {
        success: true,
        data: null
    }
}