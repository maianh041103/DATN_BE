"use strict";
const Sequelize = require("sequelize");
const discountContant = require('../../../src/mpModules/discount/discountContant');
module.exports = (sequelize, DataTypes) => {
    const DiscountBranch = sequelize.define(
        "DiscountBranch",
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
            branchId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
        },
        {
            tableName: "discount_branches",
            timestamps: false,
        }
    );

    DiscountBranch.associate = function (models) {
        DiscountBranch.belongsTo(models.Discount, {
            as: "discount",
            foreignKey: "discountId",
            sourceKey: 'id',
        }),
            DiscountBranch.belongsTo(models.Branch, {
                as: "branch",
                foreignKey: "branchId",
                sourceKey: 'id',
            })
    };

    return DiscountBranch;
};
