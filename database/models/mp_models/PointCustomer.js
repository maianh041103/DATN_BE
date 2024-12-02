"use strict";
const Sequelize = require("sequelize");
const pointContant = require("../../../src/mpModules/point/pointContant");
module.exports = (sequelize, DataTypes) => {
    const PointCustomer = sequelize.define(
        "PointCustomer",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            pointId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            groupCustomerId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM(pointContant.typePoint.ORDER, pointContant.typePoint.PRODUCT),
                allowNull: true
            }
        },
        {
            tableName: "point_customers",
            timestamps: false,
        }
    );

    PointCustomer.associate = function (models) {
        PointCustomer.belongsTo(models.Point, {
            as: "point",
            foreignKey: "pointId",
            sourceKey: 'id',
        }),
            PointCustomer.belongsTo(models.GroupCustomer, {
                as: "groupCustomer",
                foreignKey: "groupCustomerId",
                sourceKey: 'id',
            })
    };

    return PointCustomer;
};
