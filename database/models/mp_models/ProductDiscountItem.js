"use strict";
const Sequelize = require("sequelize");
const discountContant = require('../../../src/mpModules/discount/discountContant');
const Discount = require("./Discount");
module.exports = (sequelize, DataTypes) => {
    const ProductDiscountItem = sequelize.define(
        "ProductDiscountItem",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            discountItemId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            productUnitId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true,
            },
            groupId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true,
            },
            isCondition: {
                //True la hàng mua, False là hàng áp dụng
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
        {
            tableName: "product_discount_items",
            timestamps: false,
        }
    );

    ProductDiscountItem.associate = function (models) {
        ProductDiscountItem.belongsTo(models.DiscountItem, {
            as: "discountItem",
            foreignKey: "discountItemId",
            sourceKey: 'id',
        }),
            ProductDiscountItem.belongsTo(models.ProductUnit, {
                as: "productUnit",
                foreignKey: "productUnitId",
                sourceKey: 'id',
            }),
            ProductDiscountItem.belongsTo(models.GroupProduct, {
                as: "groupProduct",
                foreignKey: "groupId",
                sourceKey: 'id',
            })
    };

    return ProductDiscountItem;
};
