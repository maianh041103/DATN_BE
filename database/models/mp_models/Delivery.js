"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const Delivery = sequelize.define(
        "Delivery",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            code: {
                allowNull: true,
                type: Sequelize.STRING(20)
            },
            price: {
                allowNull: true,
                type: Sequelize.INTEGER,
            },
            name:{
                allowNull: true,
                type:Sequelize.STRING,
            },
            startDate:{
                allowNull: true,
                type: Sequelize.DATE
            },
            endDate:{
                allowNull: true,
                type: Sequelize.DATE
            }
        },
        {
            tableName: "delivery",
            timestamps: false,
            paranoid: false,
        }
    );

    Delivery.associate = function (models) {
    };
    return Delivery;
};
