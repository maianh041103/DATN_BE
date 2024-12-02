"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const MarketNotification = sequelize.define(
        "MarketNotification",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            marketOrderId:{
                type:DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            createdAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
        },
        {
            tableName: "market_notification",
            timestamps: false,
        }
    );

    MarketNotification.associate = function (models) {
        MarketNotification.belongsTo(models.MarketOrder, {
            as: "marketOrder",
            foreignKey: "marketOrderId",
            targetKey: "id",
        });
    };

    return MarketNotification;
};
