"use strict";
module.exports = (sequelize, DataTypes) => {
    const SaleReturnItem = sequelize.define(
        "SaleReturnItem",
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER.UNSIGNED
            },
            saleReturnId: {
                allowNull: true,
                type: DataTypes.INTEGER.UNSIGNED
            },
            branchId: {
                allowNull: true,
                type: DataTypes.INTEGER.UNSIGNED
            },
            productUnitId: {
                allowNull: true,
                type: DataTypes.INTEGER
            },
            quantity: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            discount: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            price: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            totalPrice: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            point: {
                allowNull: true,
                type:DataTypes.INTEGER
            }
        },
        {
            tableName: "sale_return_item",
            timestamps: true,
            paranoid: true
        }
    );

    SaleReturnItem.associate = function (models) {
        SaleReturnItem.belongsTo(models.Branch, {
            foreignKey: "branchId",
            targetKey: "id",
            as: "branch"
        });

        SaleReturnItem.belongsTo(models.User, {
            foreignKey: "createdBy",
            targetKey: "id",
            as: "creator"
        });

        SaleReturnItem.belongsTo(models.User, {
            foreignKey: "updatedBy",
            targetKey: "id",
            as: "updater"
        });

        SaleReturnItem.belongsTo(models.SaleReturn, {
            foreignKey: "saleReturnId",
            targetKey: "id",
            as: "saleReturn"
        });

        SaleReturnItem.belongsTo(models.ProductUnit, {
            foreignKey: "productUnitId",
            targetKey: "id",
            as: "productUnit"
        });

        SaleReturnItem.hasMany(models.SaleReturnBatch, {
            as: "batches",
            foreignKey: 'saleReturnItemId',
            sourceKey: 'id',
        });
    };

    return SaleReturnItem;
};