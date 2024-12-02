"use strict";
const Sequelize = require("sequelize");
const marketSellContant = require("../../../src/mpModules/marketSell/marketSellContant");
module.exports = (sequelize, DataTypes) => {
    const HistoryPurchase = sequelize.define(
        "HistoryPurchase",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            marketOrderId: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED
            },
            status:{
                allowNull: false,
                type: DataTypes.ENUM(
                    marketSellContant.STATUS_ORDER.DONE,
                    marketSellContant.STATUS_ORDER.CONFIRM,
                    marketSellContant.STATUS_ORDER.PROCESSING,
                    marketSellContant.STATUS_ORDER.SEND,
                    marketSellContant.STATUS_ORDER.CANCEL,
                    marketSellContant.STATUS_ORDER.PENDING,
                    marketSellContant.STATUS_ORDER.CLOSED,
                )
            },
            time:{
                allowNull:true,
                type: DataTypes.DATE,
                defaultValue: Sequelize.NOW
            },
            note:{
                allowNull:true,
                type:DataTypes.TEXT
            },
            createdBy:{
                allowNull:true,
                type:DataTypes.INTEGER(10).UNSIGNED
            }
        },
        {
            tableName: "history_purchase",
            timestamps: false,
            paranoid: false,
        }
    );

    HistoryPurchase.associate = function (models) {
        HistoryPurchase.belongsTo(models.MarketOrder, {
            as: "marketOrder",
            foreignKey: "marketOrderId",
            targetKey: "id",
        });
        HistoryPurchase.belongsTo(models.User,{
            as:"userCreated",
            foreignKey: "createdBy",
            targetKey: "id"
        })
    };
    return HistoryPurchase
};