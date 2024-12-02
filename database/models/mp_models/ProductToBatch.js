'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProductToBatch = sequelize.define('ProductToBatch', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storeId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    branchId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    batchId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productUnitId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.DOUBLE(11, 2).UNSIGNED,
    },
    totalPrice: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    importPrice: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    discount: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
      defaultValue: 0
    },
    expiryDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    }
  }, {
    tableName: 'product_to_batches',
    timestamps: true,
    paranoid: true,
  });
  ProductToBatch.associate = function (models) {
    ProductToBatch.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    ProductToBatch.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    ProductToBatch.belongsTo(models.Batch, {
      as: "batch",
      foreignKey: "batchId",
      targetKey: "id",
    });

    ProductToBatch.belongsTo(models.Product, {
      as: "product",
      foreignKey: "productId",
      targetKey: "id",
    });

    ProductToBatch.belongsTo(models.ProductUnit, {
      as: "productUnit",
      foreignKey: "productUnitId",
      targetKey: "id",
    });
  };
  return ProductToBatch;
};
