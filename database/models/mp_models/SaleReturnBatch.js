"use strict";
module.exports = (sequelize, DataTypes) => {
    const SaleReturnBatch = sequelize.define(
        "SaleReturnBatch",
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            saleReturnItemId: {
                allowNull: true,
                type: DataTypes.INTEGER
            },
            batchId: {
                allowNull: true,
                type: DataTypes.INTEGER
            },
            quantity: {
                allowNull: true,
                type: DataTypes.INTEGER
            },
            createdAt: {
                allowNull: true,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE
            },
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE
            }
        },
        {
            tableName: "sale_return_batch",
            timestamps: true,
            paranoid: true
        }
    );

    SaleReturnBatch.associate = function (models) {
        // Define associations if any
        SaleReturnBatch.belongsTo(models.SaleReturnItem, {
            foreignKey: "saleReturnItemId",
            targetKey: "id",
            as: "saleReturnItem"
        });

        SaleReturnBatch.belongsTo(models.Batch, {
            foreignKey: "batchId",
            targetKey: "id",
            as: "batch"
        });
    };

    return SaleReturnBatch;
};