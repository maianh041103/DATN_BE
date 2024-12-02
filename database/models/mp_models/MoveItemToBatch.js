'use strict';
module.exports = (sequelize, DataTypes) => {
  const MoveItemToBatch = sequelize.define('MoveItemToBatch', {
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
    toBatchId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    quantity: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    }
  },
  {
    tableName: 'move_item_to_batch',
    timestamps: true,
  });
  MoveItemToBatch.associate = function (models) {
    MoveItemToBatch.belongsTo(models.Batch, {
      as: 'batch',
      foreignKey: 'toBatchId',
      targetKey: 'id',
    });

    MoveItemToBatch.belongsTo(models.MoveItem, {
      as: "moveItem",
      foreignKey: "moveItemId",
      targetKey: "id",
    });
  };
  return MoveItemToBatch;
};
