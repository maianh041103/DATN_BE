import {productAttributes, productIncludes} from "../product/constant";
import Sequelize from "sequelize";
const models = require("../../../database/models");

export const moveStatus = {
    MOVING: "MOVING",
    RECEIVED: "RECEIVED",
    TRASH: "TRASH",
};

export const moveAttributes = ["id", "code", "fromBranchId", "toBranchId", "movedAt", "movedBy",
    "receivedAt", "receivedBy", "status", "totalPrice", "note", "receiveNote", "totalItem", "totalPrice","createdAt",
    [Sequelize.literal(`(SELECT SUM(move_items.quantity) FROM move_items 
    WHERE move_items.moveId = Move.id)`), 'totalCountMoved'],
    [Sequelize.literal(`(SELECT SUM(move_items.quantity * move_items.price) 
    FROM move_items WHERE move_items.moveId = Move.id)`), 'totalPriceMoved'],
    [Sequelize.literal(`(SELECT SUM(move_items.toQuantity) FROM move_items 
    WHERE move_items.moveId = Move.id)`), 'totalCountReceived'],
    [Sequelize.literal(`(SELECT SUM(move_items.toQuantity * move_items.price) 
    FROM move_items WHERE move_items.moveId = Move.id)`), 'totalPriceReceived'],
]
export const moveInclude = [
    {
        model: models.Branch,
        as: 'fromBranch',
        attributes: ['id', 'name'],
    },
    {
        model: models.Branch,
        as: 'toBranch',
        attributes: ['id', 'name'],
    },
    {
        model: models.User,
        as: 'movedByUser',
        attributes: ['id', 'username', 'fullName'],
    },
    {
        model: models.User,
        as: 'receivedByUser',
        attributes: ['id', 'username', 'fullName'],
    },
    {
        model: models.MoveItem,
        as: 'items',
        attributes: ['id', 'quantity', 'toQuantity', 'price'],
        include: [
            {
                model: models.ProductUnit,
                as: 'productUnit',
                attributes: ['id', 'unitName', 'exchangeValue', 'isBaseUnit', 'code'],
            },
            {
                model: models.Product,
                as: 'product',
                attributes: productAttributes,
                include: productIncludes
            },
            {
                model: models.MoveItemBatch,
                as: 'fromBatches',
                attributes: ['id', 'quantity'],
                include: [
                    {
                        model: models.Batch,
                        as: 'batch',
                        attributes: ['id', 'name', 'quantity', 'expiryDate']
                    },
                ]
            },
            {
                model: models.MoveItemToBatch,
                as: 'toBatches',
                attributes: ['id', 'quantity'],
                include: [
                    {
                        model: models.Batch,
                        as: 'batch',
                        attributes: ['id', 'name', 'quantity', 'expiryDate']
                    },
                ]
            },
        ]
    },
]
