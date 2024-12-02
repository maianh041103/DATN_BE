'use strict';
module.exports = (sequelize, DataTypes) => {
  const PurchaseReturnItemBatch = sequelize.define('PurchaseReturnItemBatch', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    purchaseReturnItemId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    batchId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    quantity: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    }
  }, {
    tableName: 'purchase_return_item_batch',
    timestamps: true,
    paranoid: true,
  });
  PurchaseReturnItemBatch.associate = function (models) {
    PurchaseReturnItemBatch.belongsTo(models.Batch, {
      as: 'batch',
      foreignKey: 'batchId',
      targetKey: 'id',
    });

    PurchaseReturnItemBatch.belongsTo(models.PurchaseReturnToProduct, {
      as: "purchaseReturnItem",
      foreignKey: "purchaseReturnItemId",
      targetKey: "id",
    });
  };
  return PurchaseReturnItemBatch;
};
