"use strict";
const Sequelize = require("sequelize");
const transactionContant = require('../../../src/mpModules/transaction/transactionContant');
module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define(
        "Transaction",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            ballotType: {
                type: DataTypes.ENUM(
                    transactionContant.BALLOTTYPE.EXPENSES,
                    transactionContant.BALLOTTYPE.INCOME
                ),
                defaultValue: transactionContant.BALLOTTYPE.EXPENSES,
                allowNull: false
            },
            code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            paymentDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            typeId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            value: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            },
            //Tài khoản tạo (tài khoản đăng nhập)
            createdBy: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            //Nhân viên thu/chi 
            userId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            target: {
                type: DataTypes.ENUM(
                    transactionContant.TARGET.CUSTOMER,
                    transactionContant.TARGET.OTHER,
                    transactionContant.TARGET.SUPPLIER,
                    transactionContant.TARGET.USER,
                    transactionContant.TARGET.BRANCH
                ),
                allowNull: false,
                defaultValue: transactionContant.TARGET.OTHER,
            },
            targetId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            note: {
                type: DataTypes.STRING,
                allowNull: true
            },
            isDebt: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isPaymentOrder: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            branchId: {
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
            tableName: "transactions",
            timestamps: true,
            paranoid: true,
        }
    );

    Transaction.associate = function (models) {
        Transaction.belongsTo(models.TypeTransaction, {
            as: 'typeTransaction',
            foreignKey: 'typeId',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.User, {
            as: 'userCreated',
            foreignKey: 'createdBy',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.UserTransaction, {
            as: 'targetOther',
            foreignKey: 'targetId',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.Customer, {
            as: 'targetCustomer',
            foreignKey: 'targetId',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.Supplier, {
            as: 'targetSupplier',
            foreignKey: 'targetId',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.User, {
            as: 'targetUser',
            foreignKey: 'targetId',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.Branch, {
            as: 'targetBranch',
            foreignKey: 'targetId',
            targetKey: 'id',
        });
        Transaction.belongsTo(models.Branch, {
            as: "branch",
            foreignKey: "branchId",
            targetKey: 'id',
        });
        Transaction.hasMany(models.Payment, {
            as: "payment",
            foreignKey: "transactionId",
            sourceKey: 'id',
        })
    };

    return Transaction;
};
