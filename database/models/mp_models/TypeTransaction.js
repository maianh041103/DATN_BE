"use strict";
const Sequelize = require("sequelize");
const transactionContant = require('../../../src/mpModules/transaction/transactionContant');
module.exports = (sequelize, DataTypes) => {
    const TypeTransaction = sequelize.define(
        "TypeTransaction",
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
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            ballotType: {
                type: DataTypes.ENUM(
                    transactionContant.BALLOTTYPE.EXPENSES,
                    transactionContant.BALLOTTYPE.INCOME
                ),
                defaultValue: transactionContant.BALLOTTYPE.EXPENSES,
                allowNull: false
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
            tableName: "type_transactions",
            timestamps: true,
            paranoid: true,
        }
    );

    TypeTransaction.associate = function (models) {
        TypeTransaction.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: 'id',
        })
    };

    return TypeTransaction;
};
