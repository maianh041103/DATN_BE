'use strict';
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const InventoryCheckingBatch = sequelize.define('InventoryCheckingBatch', {
        id: {
            type: Sequelize.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        inventoryCheckingProductId: {
            allowNull: true,
            type: Sequelize.INTEGER(11).UNSIGNED
        },
        realQuantity: {
            allowNull: false,
            type: Sequelize.INTEGER(11).UNSIGNED,
        },
        batchId: {
            allowNull: true,
            type: Sequelize.INTEGER(11).UNSIGNED
        },
        difference: {
            allowNull: true,
            type: Sequelize.INTEGER(11)
        },
        isChange: {
            allowNull: true,
            type: Sequelize.BOOLEAN
        }
    }, {
        tableName: 'inventories_checking_batch',
        timestamps: false
    });
    InventoryCheckingBatch.associate = function (models) {
        InventoryCheckingBatch.belongsTo(models.InventoryCheckingProduct, {
            as: "inventoryCheckingProduct",
            foreignKey: "inventoryCheckingProductId",
            targetKey: "id"
        });

        InventoryCheckingBatch.belongsTo(models.Batch, {
            as: "batch",
            foreignKey: 'batchId',
            targetKey: "id"
        })
    };
    return InventoryCheckingBatch;
};
