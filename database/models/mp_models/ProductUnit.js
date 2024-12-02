"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProductUnit = sequelize.define(
    "ProductUnit",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      unitName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      // Giá trị quy đổi
      exchangeValue: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Giá bán
      price: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      productId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Bán trực tiếp
      isDirectSale: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      barCode: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      point: {
        allowNull: false,
        default: 0,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      isBaseUnit: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      storeId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      branchId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      createdBy: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
    },
    {
      tableName: "product_units",
      timestamps: true,
      paranoid: true,
    }
  );
  ProductUnit.associate = function (models) {
    ProductUnit.belongsTo(models.Product, {
      as: "product",
      foreignKey: "productId",
      targetKey: "id",
    });

    ProductUnit.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    ProductUnit.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });
  };
  return ProductUnit;
};
