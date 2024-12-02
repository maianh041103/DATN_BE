'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProductBatchHistory = sequelize.define('ProductBatchHistory', {
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
    inboundProductId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    purchaseReturnProductId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    batchId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productUnitId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    initQuantity: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
      defaultValue: 0,
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
      allowNull: true,
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
    tableName: 'product_to_batch_histories',
    timestamps: true,
    paranoid: true,
  });
  ProductBatchHistory.associate = function (models) {
    ProductBatchHistory.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    ProductBatchHistory.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    ProductBatchHistory.belongsTo(models.Batch, {
      as: "batch",
      foreignKey: "batchId",
      targetKey: "id",
    });

    ProductBatchHistory.belongsTo(models.Product, {
      as: "product",
      foreignKey: "productId",
      targetKey: "id",
    });

    ProductBatchHistory.belongsTo(models.ProductUnit, {
      as: "productUnit",
      foreignKey: "productUnitId",
      targetKey: "id",
    });
  };
  return ProductBatchHistory;
};
