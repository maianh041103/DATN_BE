"use strict";
const Sequelize = require("sequelize");
const pointContant = require("../../../src/mpModules/point/pointContant");

module.exports = (sequelize, DataTypes) => {
    const PointHistory = sequelize.define(
        "PointHistory",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            code: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            customerId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            orderId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true
            },
            saleReturnId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true
            },
            point: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            note: {
                allowNull: true,
                type: Sequelize.STRING,
            }
        },
        {
            tableName: "point_history",
            timestamps: true,
            paranoid: true
        });

    PointHistory.associate = function (models) {
        PointHistory.belongsTo(models.Customer, {
            as: 'customer',
            foreignKey: 'customerId',
            targetKey: 'id',
        });

        PointHistory.belongsTo(models.Order, {
            as: "order",
            foreignKey: "orderId",
            targetKey: 'id',
        });

        PointHistory.belongsTo(models.SaleReturn, {
            as: "saleReturn",
            foreignKey: "saleReturnId",
            targetKey: 'id',
        })
    };

    return PointHistory;
}