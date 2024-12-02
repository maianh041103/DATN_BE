'use strict';
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const InventoryCheckingProduct = sequelize.define('InventoryCheckingProduct', {
        id: {
            type: Sequelize.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        productUnitId: {
            allowNull: false,
            type: Sequelize.INTEGER(11).UNSIGNED,
        },
        realQuantity: {
            allowNull: true,
            type: Sequelize.INTEGER(11).UNSIGNED,
        },
        inventoryCheckingId: {
            allowNull: false,
            type: Sequelize.INTEGER(11).UNSIGNED
        },
        difference: {
            allowNull: true,
            type: Sequelize.INTEGER(11)
        }
    }, {
        tableName: 'inventories_checking_product',
        timestamps: false
    });
    InventoryCheckingProduct.associate = function (models) {
        InventoryCheckingProduct.belongsTo(models.ProductUnit, {
            as: 'productUnit',
            foreignKey: 'productUnitId',
            targetKey: 'id',
        });

        InventoryCheckingProduct.belongsTo(models.InventoryChecking, {
            as: "inventoryChecking",
            foreignKey: "inventoryCheckingId",
            targetKey: "id"
        });

        InventoryCheckingProduct.hasMany(models.InventoryCheckingBatch, {
            as: "inventoryCheckingBatch",
            foreignKey: "inventoryCheckingProductId",
            sourceKey: "id"
        })
    };
    return InventoryCheckingProduct;
};
