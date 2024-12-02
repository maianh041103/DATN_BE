"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const DiscountConfig = sequelize.define(
        "DiscountConfig",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            //Gộp các khuyến mãi
            isMergeDiscount: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            //Áp dụng khuyến mãi khi đặt hàng
            isApplyOrder: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            //Tự động áp dụng khuyến mãi cho hóa đơn
            isAutoApply: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            storeId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
        },
        {
            tableName: "discount_configs",
            timestamps: false,
        }
    );

    DiscountConfig.associate = function (models) {
        DiscountConfig.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            sourceKey: 'id',
        })
    };

    return DiscountConfig;
};
