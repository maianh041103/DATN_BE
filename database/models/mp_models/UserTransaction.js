"use strict";
const Sequelize = require("sequelize");
const transactionContant = require('../../../src/mpModules/transaction/transactionContant');
module.exports = (sequelize, DataTypes) => {
    const UserTransaction = sequelize.define(
        "UserTransaction",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false
            },
            address: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            wardId: {
                allowNull: true,
                type: Sequelize.INTEGER(5).UNSIGNED,
            },
            districtId: {
                allowNull: true,
                type: Sequelize.INTEGER(5).UNSIGNED,
            },
            provinceId: {
                allowNull: true,
                type: Sequelize.INTEGER(2).UNSIGNED,
            },
            note: {
                type: DataTypes.STRING,
                allowNull: true
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
            }
        },
        {
            tableName: "user_transactions",
            timestamps: true,
            paranoid: true,
        }
    );

    UserTransaction.associate = function (models) {
        UserTransaction.belongsTo(models.Province, {
            as: "province",
            foreignKey: "provinceId",
            targetKey: "id",
        });

        UserTransaction.belongsTo(models.District, {
            as: "district",
            foreignKey: "districtId",
            targetKey: "id",
        });

        UserTransaction.belongsTo(models.Ward, {
            as: "ward",
            foreignKey: "wardId",
            targetKey: "id",
        });

        UserTransaction.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: 'id',
        })
    };

    return UserTransaction;
};
