"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const CustomerNote = sequelize.define(
        "CustomerNote",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            note: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            customerId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            createdTime: {
                allowNull: true,
                type: Sequelize.DATE,
            }
        },
        {
            tableName: "customer_notes",
            timestamps: false,
            paranoid: false,
        }
    );

    CustomerNote.associate = function (models) {
        CustomerNote.belongsTo(models.Customer, {
            as: "customer",
            foreignKey: "customerId",
            targetKey: 'id',
        });
        CustomerNote.belongsTo(models.User, {
            as: "userCreate",
            foreignKey: "userId",
            targetKey: 'id',
        })
    };

    return CustomerNote;
};
