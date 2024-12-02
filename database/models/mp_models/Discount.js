"use strict";
const Sequelize = require("sequelize");
const discountContant = require('../../../src/mpModules/discount/discountContant');
module.exports = (sequelize, DataTypes) => {
    const Discount = sequelize.define(
        "Discount",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    discountContant.discountStatus.ACTIVE,
                    discountContant.discountStatus.INACTIVE
                ),
                defaultValue: discountContant.discountStatus.ACTIVE,
            },
            note: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            target: {
                type: DataTypes.ENUM(
                    discountContant.discountTarget.ORDER,
                    discountContant.discountTarget.PRODUCT
                ),
                defaultValue: discountContant.discountTarget.ORDER,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM(
                    discountContant.discountType.ORDER_PRICE,
                    discountContant.discountType.PRODUCT_PRICE,
                    discountContant.discountType.GIFT,
                    discountContant.discountType.LOYALTY,
                    discountContant.discountType.PRICE_BY_BUY_NUMBER,
                ),
                defaultValue: discountContant.discountType.ORDER_PRICE,
                allowNull: false,
            },
            isMultiple: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            isAllCustomer: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isAllBranch: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            storeId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
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
            tableName: "discounts",
            timestamps: true,
            paranoid: true,
        }
    );

    Discount.associate = function (models) {
        Discount.hasMany(models.DiscountItem, {
            as: 'discountItem',
            foreignKey: 'discountId',
            sourceKey: 'id',
        });
        Discount.hasMany(models.DiscountTime, {
            as: 'discountTime',
            foreignKey: 'discountId',
            sourceKey: 'id',
        });
        Discount.hasMany(models.DiscountBranch, {
            as: 'discountBranch',
            foreignKey: 'discountId',
            sourceKey: 'id',
        });
        Discount.hasMany(models.DiscountCustomer, {
            as: 'discountCustomer',
            foreignKey: 'discountId',
            sourceKey: 'id',
        });
        Discount.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: 'id',
        });
    };

    return Discount;
};
