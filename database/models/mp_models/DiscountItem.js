"use strict";
const Sequelize = require("sequelize");
const discountContant = require('../../../src/mpModules/discount/discountContant');
module.exports = (sequelize, DataTypes) => {
    const DiscountItem = sequelize.define(
        "DiscountItem",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            discountId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },

            //condition
            orderFrom: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true,
            }, //Hóa đơn từ
            fromQuantity: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true,
            }, //số lượng mặt hàng mua từ

            //apply
            maxQuantity: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true,
            },
            discountValue: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true,
            },
            discountType: {
                type: DataTypes.ENUM(
                    discountContant.discountDiscountType.AMOUNT,
                    discountContant.discountDiscountType.PERCENT,
                ),
                allowNull: true
            },
            pointType: {
                type: DataTypes.ENUM(
                    discountContant.discountDiscountType.AMOUNT,
                    discountContant.discountDiscountType.PERCENT,
                ),
                allowNull: true,
            },
            isGift: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            pointValue: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true,
            },
            fixedPrice: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true
            },
            changeType: {
                type: DataTypes.ENUM(
                    discountContant.discountDiscountType.TYPE_PRICE,
                    discountContant.discountDiscountType.TYPE_DISCOUNT,
                ),
                allowNull: true,
            }
        },
        {
            tableName: "discount_items",
            timestamps: false,
        }
    );

    DiscountItem.associate = function (models) {
        DiscountItem.belongsTo(models.Discount, {
            as: "discount",
            foreignKey: "discountId",
            sourceKey: 'id',
        })

        DiscountItem.hasMany(models.ProductDiscountItem, {
            as: 'productDiscount',
            foreignKey: 'discountItemId',
            sourceKey: 'id',
            onDelete: 'CASCADE'
        })
    };

    return DiscountItem;
};
