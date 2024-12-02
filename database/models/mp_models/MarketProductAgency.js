"use strict";
const marketConfigContant = require("../../../src/mpModules/marketConfig/marketConfigContant");
module.exports = (sequelize, DataTypes) => {
    const MarketProductAgency = sequelize.define(
        "MarketProductAgency",
        {
            id: {
                type: DataTypes.INTEGER(10).UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            marketProductId: {
                allowNull: false,
                type: DataTypes.INTEGER(10).UNSIGNED,
            },
            agencyId: {
                allowNull: true,
                type: DataTypes.INTEGER(10).UNSIGNED,
            },
            groupAgencyId: {
                allowNull: true,
                type: DataTypes.INTEGER(10).UNSIGNED,
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
            tableName: "market_product_agency",
            timestamps: true,
            paranoid: true,
        }
    );

    MarketProductAgency.associate = function (models) {
        MarketProductAgency.belongsTo(models.MarketProduct, {
            as: "marketProduct",
            foreignKey: "marketProductId",
            targetKey: "id"
        });

        MarketProductAgency.belongsTo(models.RequestAgency, {
            as: "agency",
            foreignKey: "agencyId",
            targetKey: "id"
        });

        MarketProductAgency.belongsTo(models.GroupAgency, {
            as: "groupAgency",
            foreignKey: "groupAgencyId",
            targetKey: "id"
        });
    };
    return MarketProductAgency;
};
