"use strict";
module.exports = (sequelize, DataTypes) => {
    const MarketProductBatch = sequelize.define(
        "MarketProductBatch",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            marketProductId: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                allowNull: false
            },
            batchId: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                allowNull: true
            },
            quantity: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
                defaultValue: 0,
            },
            // Số lượng đã bán
            quantitySold: {
                allowNull: true,
                type: DataTypes.INTEGER(10).UNSIGNED,
                defaultValue: 0,
            },
            storeId: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
            },
            createdAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "market_product_batches",
            timestamps: true,
            paranoid: true,
        }
    );

    MarketProductBatch.associate = function (models) {
        MarketProductBatch.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: "id"
        });

        MarketProductBatch.belongsTo(models.MarketProduct, {
            as: "marketProduct",
            foreignKey: "marketProductId",
            targetKey: "id"
        });

        MarketProductBatch.belongsTo(models.Batch,{
            as:"batch",
            foreignKey: "batchId",
            targetKey: "id"
        })
    };
    return MarketProductBatch;
};
