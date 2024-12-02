"use strict";
const Sequelize = require("sequelize");
const discountContant = require('../../../src/mpModules/discount/discountContant');
module.exports = (sequelize, DataTypes) => {
    const DiscountCustomer = sequelize.define(
        "DiscountCustomer",
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
            groupCustomerId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
        },
        {
            tableName: "discount_customers",
            timestamps: false,
        }
    );

    DiscountCustomer.associate = function (models) {
        DiscountCustomer.belongsTo(models.Discount, {
            as: "discount",
            foreignKey: "discountId",
            sourceKey: 'id',
        }),
            DiscountCustomer.belongsTo(models.GroupCustomer, {
                as: "groupCustomer",
                foreignKey: "groupCustomerId",
                sourceKey: 'id',
            })
    };

    return DiscountCustomer;
};
