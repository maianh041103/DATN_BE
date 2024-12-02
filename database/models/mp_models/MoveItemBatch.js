'use strict';
module.exports = (sequelize, DataTypes) => {
  const MoveItemBatch = sequelize.define('MoveItemBatch', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    moveItemId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    fromBatchId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    quantity: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    }
  },
  {
    tableName: 'move_item_batch',
    timestamps: true,
  });
  MoveItemBatch.associate = function (models) {
    MoveItemBatch.belongsTo(models.Batch, {
      as: 'batch',
      foreignKey: 'fromBatchId',
      targetKey: 'id',
    });

    MoveItemBatch.belongsTo(models.MoveItem, {
      as: "moveItem",
      foreignKey: "moveItemId",
      targetKey: "id",
    });
  };
  return MoveItemBatch;
};
