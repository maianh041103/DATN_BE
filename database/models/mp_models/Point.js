"use strict";
const Sequelize = require("sequelize");
const pointContant = require("../../../src/mpModules/point/pointContant");

module.exports = (sequelize, DataTypes) => {
    const Point = sequelize.define(
        "Point",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            //Đối với hàng hóa có áp dụng tích điểm mặc định không
            isConvertDefault: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            type: {
                type: DataTypes.ENUM(pointContant.typePoint.ORDER, pointContant.typePoint.PRODUCT),
                allowNull: false,
                defaultValue: pointContant.typePoint.ORDER
            },
            //Tỷ lệ quy đổi điểm thưởng converMoneyBuy VND = 1 điểm thưởng
            convertMoneyBuy: {
                type: DataTypes.INTEGER(15),
                allowNull: false,
                defaultValue: 0
            },
            //Cho thanh toán bằng điểm không
            isPointPayment: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            convertPoint: {
                type: DataTypes.INTEGER(15),
                allowNull: true,
                defaultValue: 0
            },
            convertMoneyPayment: {
                type: DataTypes.INTEGER(15),
                allowNull: true,
                defaultValue: 0
            },
            //convertPoint = convertMoneyPayment VND
            afterByTime: {
                type: DataTypes.INTEGER(3),
                allowNull: true,
                defaultValue: 0
            },
            //Tích điểm cho sản phẩm giảm giá
            isDiscountProduct: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            //Tích điểm cho đơn hàng giảm giá
            isDiscountOrder: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            //Tích điểm cho hóa đơn thanh toán bằng điểm thưởng
            isPointBuy: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isAllCustomer: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            storeId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM(pointContant.statusPoint.ACTIVE,
                    pointContant.statusPoint.INACTIVE
                ),
                allowNull: false,
                defaultValue: pointContant.statusPoint.ACTIVE
            }
        },
        {
            tableName: "points",
            timestamps: true,
            paranoid: true
        });

    Point.associate = function (models) {
        Point.hasMany(models.PointCustomer, {
            as: 'pointCustomer',
            foreignKey: 'pointId',
            sourceKey: 'id',
        });

        Point.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: 'id',
        })
    };

    return Point;
}