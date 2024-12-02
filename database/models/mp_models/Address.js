"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define(
        "Address",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            fullName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                allowNull: false,
                type: Sequelize.STRING(15)
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
            address: {
                allowNull: true,
                type: Sequelize.STRING(100),
            },
            storeId: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
            },
            isDefaultAddress: {
                allowNull: true,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            customerId:{
                allowNull: true,
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "addresses",
            timestamps: true,
            paranoid: true,
        }
    );

    Address.associate = function (models) {
        Address.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: "id",
        });
        Address.belongsTo(models.Ward, {
            as: "ward",
            foreignKey: "wardId",
            targetKey: "id"
        });
        Address.belongsTo(models.District, {
            as: "district",
            foreignKey: "districtId",
            targetKey: "id"
        });
        Address.belongsTo(models.Province, {
            as: "province",
            foreignKey: "provinceId",
            targetKey: "id"
        });
    };
    return Address;
};
