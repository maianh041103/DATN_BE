const marketContant = require("../../../src/mpModules/marketConfig/marketConfigContant");

"use strict";
module.exports = (sequelize, DataTypes) => {
    const MarketImage = sequelize.define(
        "MarketImage",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            imageBannerId:{
                type:DataTypes.STRING,
                allowNull: true
            },
            imageTopId:{
                type:DataTypes.STRING,
                allowNull: true
            },
            imageBottomId:{
                type:DataTypes.STRING,
                allowNull: true
            },
            storeId:{
              type:DataTypes.INTEGER(10).UNSIGNED,
              allowNull: false,
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
            tableName: "market_images",
            timestamps: true,
            paranoid: true,
        }
    );

    MarketImage.associate = function (models) {
        MarketImage.belongsTo(models.Store, {
            as: "store",
            foreignKey: "storeId",
            targetKey: "id",
        });
    };
    return MarketImage;
};
