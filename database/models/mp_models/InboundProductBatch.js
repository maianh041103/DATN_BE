'use strict';
module.exports = (sequelize, DataTypes) => {
  const InboundProductBatch = sequelize.define('InboundProductBatch', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    inboundProductId: {
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
    tableName: 'inbound_product_batch',
    timestamps: true,
    paranoid: true,
  });
  InboundProductBatch.associate = function (models) {
    InboundProductBatch.belongsTo(models.Batch, {
      as: 'batch',
      foreignKey: 'batchId',
      targetKey: 'id',
    });

    InboundProductBatch.belongsTo(models.InboundToProduct, {
      as: "inboundProduct",
      foreignKey: "inboundProductId",
      targetKey: "id",
    });
  };
  return InboundProductBatch;
};
