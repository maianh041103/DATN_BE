'use strict';
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const InventoryChecking = sequelize.define('InventoryChecking', {
        id: {
            type: Sequelize.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        code: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        userCreateId: {
            allowNull: false,
            type: Sequelize.INTEGER(11).UNSIGNED
        },
        note: {
            allowNull: true,
            type: DataTypes.STRING(50),
        },
        branchId: {
            allowNull: false,
            type: Sequelize.INTEGER(11).UNSIGNED
        }
    }, {
        tableName: 'inventories_checking',
        timestamps: true
    });
    InventoryChecking.associate = function (models) {
        InventoryChecking.belongsTo(models.User, {
            as: "userCreate",
            foreignKey: "userCreateId",
            targetKey: "id",
        });

        InventoryChecking.belongsTo(models.Branch, {
            as: "branch",
            foreignKey: "branchId",
            targetKey: "id"
        });

        InventoryChecking.hasMany(models.InventoryCheckingProduct, {
            as: "inventoryCheckingProduct",
            foreignKey: "inventoryCheckingId",
            sourceKey: "id"
        })
    };
    return InventoryChecking;
};
