'use strict';
module.exports = (sequelize, DataTypes) => {
  const InboundToProduct = sequelize.define('InboundToProduct', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storeId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    branchId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    quantity: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
    },
    price: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productUnitId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    discount: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    inboundId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
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
    tableName: 'inbound_to_products',
    timestamps: true,
    paranoid: true,
  });
  InboundToProduct.associate = function (models) {
    InboundToProduct.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    InboundToProduct.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    InboundToProduct.belongsTo(models.Product, {
      as: "product",
      foreignKey: "productId",
      targetKey: "id",
    });

    InboundToProduct.belongsTo(models.ProductUnit, {
      as: "productUnit",
      foreignKey: "productUnitId",
      targetKey: "id",
    });

    InboundToProduct.hasMany(models.ProductBatchHistory, {
      as: "productBatchHistories",
      foreignKey: 'inboundProductId',
      sourceKey: 'id',
    });

    InboundToProduct.hasMany(models.InboundProductBatch, {
      as: "batches",
      foreignKey: 'inboundProductId',
      sourceKey: 'id',
    });
  };
  return InboundToProduct;
};
