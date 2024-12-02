"use strict";
const Sequelize = require("sequelize");
const discountContant = require('../../../src/mpModules/discount/discountContant');
const Discount = require("./Discount");
module.exports = (sequelize, DataTypes) => {
    const DiscountTime = sequelize.define(
        "DiscountTime",
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            discountId: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            dateFrom: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            dateTo: {
                type: Sequelize.DATE,
                allowNull: false
            },
            //Áp dụng vào các ngày trong tháng : 1 2 3 4
            byDay: {
                type: Sequelize.STRING,
                allowNull: true
            },
            byMonth: {
                type: Sequelize.STRING,
                allowNull: true
            },
            byHour: {
                type: Sequelize.STRING,
                allowNull: true
            },
            //thứ trong tuần
            byWeekDay: {
                type: Sequelize.STRING,
                allowNull: true
            },
            isWarning: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            isBirthday: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            birthdayType: {
                type: DataTypes.ENUM(
                    discountContant.discountBirthday.DAY,
                    discountContant.discountBirthday.WEEK,
                    discountContant.discountBirthday.MONTH
                ),
                defaultValue: discountContant.discountBirthday.DAY,
                allowNull: true,
            },
        },
        {
            tableName: "discount_times",
            timestamps: false,
        }
    );

    DiscountTime.associate = function (models) {
        DiscountTime.belongsTo(models.Discount, {
            as: "discount",
            foreignKey: "discountId",
            sourceKey: 'id',
        })
    };
    return DiscountTime;
};
