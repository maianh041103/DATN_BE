"use strict";
const marketConfigContant = require("../../../src/mpModules/marketConfig/marketConfigContant");
module.exports = (sequelize, DataTypes) => {
    const MarketProduct = sequelize.define(
        "MarketProduct",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            productId: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                allowNull: false
            },
            productUnitId:{
                type:DataTypes.INTEGER(10).UNSIGNED,
                allowNull: false
            },
            marketType: {
                type: DataTypes.ENUM(marketConfigContant.MARKET_TYPE.COMMON,
                    marketConfigContant.MARKET_TYPE.PRIVATE),
                allowNull: false
            },
            // Giá bán
            price: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
            },
            // Giá khuyến mãi
            discountPrice: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
                defaultValue: 0
            },
            quantity: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
                defaultValue: 0,
            },
            // Số lượng đã bán
            quantitySold: {
                allowNull: true,
                type: DataTypes.INTEGER(10).UNSIGNED,
                defaultValue: 0,
            },
            status: {
                allowNull: true,
                type: DataTypes.ENUM(marketConfigContant.PRODUCT_MARKET_STATUS.ACTIVE,
                    marketConfigContant.PRODUCT_MARKET_STATUS.INACTIVE
                ),
                defaultValue: marketConfigContant.PRODUCT_MARKET_STATUS.ACTIVE,
            },
            storeId: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
            },
            description: {
                allowNull: true,
                type: DataTypes.STRING,
            },
            images: {
                allowNull: true,
                type: DataTypes.STRING
            },
            thumbnail:{
                allowNull:true,
                type:DataTypes.INTEGER(10).UNSIGNED
            },
            isDefaultPrice: {
                allowNull: true,
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            createdBy: {
                allowNull: true,
                type: DataTypes.INTEGER(10).UNSIGNED
            },
            updatedAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            updatedBy: {
                allowNull: true,
                type: DataTypes.INTEGER(10).UNSIGNED
            },
            deletedAt: {
                allowNull: true,
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "market_products",
            timestamps: true,
            paranoid: true,
        }
    );

    MarketProduct.associate = function (models) {
        MarketProduct.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: "id",
        });

        MarketProduct.belongsTo(models.Product, {
            as: "product",
            foreignKey: "productId",
            targetKey: "id"
        });

        MarketProduct.belongsTo(models.User, {
            as: "userCreated",
            foreignKey: "createdBy",
            targetKey: "id"
        });

        MarketProduct.belongsTo(models.User, {
            as: "userUpdated",
            foreignKey: "updatedBy",
            targetKey: "id"
        });

        MarketProduct.hasMany(models.MarketProductAgency,{
            as:"agencys",
            sourceKey:"id",
            foreignKey: "marketProductId"
        });

        MarketProduct.hasMany(models.MarketProductBatch,{
            as:"batches",
            sourceKey:"id",
            foreignKey: "marketProductId"
        });

        MarketProduct.belongsTo(models.Image,{
            as:"imageCenter",
            targetKey:"id",
            foreignKey:"thumbnail"
        });

        MarketProduct.belongsTo(models.ProductUnit,{
            as:"productUnit",
            targetKey:"id",
            foreignKey:"productUnitId"
        })
    };
    return MarketProduct;
};
