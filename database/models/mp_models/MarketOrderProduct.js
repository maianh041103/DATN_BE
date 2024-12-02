"use strict";

module.exports = (sequelize, DataTypes) => {
    const MarketOrderProduct = sequelize.define(
        "MarketOrderProduct",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            marketOrderId: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED
            },
            marketProductId: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED
            },
            quantity:{
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED
            },
            price:{
                allowNull: false,
                type:DataTypes.INTEGER(20).UNSIGNED
            },
            itemPrice:{
                allowNull:false,
                type:DataTypes.INTEGER(20).UNSIGNED
            },
            discountItemId:{
                allowNull:true,
                type:DataTypes.INTEGER(10).UNSIGNED
            }
        },
        {
            tableName: "market_order_products",
            timestamps: false,
            paranoid: false,
        }
    );

    MarketOrderProduct.associate = function (models) {
        MarketOrderProduct.belongsTo(models.MarketOrder, {
            as: "marketOrder",
            foreignKey: "marketOrderId",
            targetKey: "id",
        });
        MarketOrderProduct.belongsTo(models.MarketProduct, {
            as: "marketProduct",
            foreignKey: "marketProductId",
            targetKey: "id"
        });
        MarketOrderProduct.hasMany(models.MarketOrderBatch,{
            as: "orderBatches",
            foreignKey:"marketOrderProductId",
            sourceKey:"id"
        });
        MarketOrderProduct.belongsTo(models.DiscountItem,{
            as:"discountProductItem",
            foreignKey:"discountItemId",
            targetKey:"id",
        });
    };
    return MarketOrderProduct;
};
