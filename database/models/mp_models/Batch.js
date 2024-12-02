'use strict';
module.exports = (sequelize, DataTypes) => {
  const Batch = sequelize.define('Batch', {
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
    productId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    expiryDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER(10),
    },
    isUsed: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    oldQuantity: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
  }, {
    tableName: 'batches',
    timestamps: true,
    paranoid: true,
  });
  Batch.associate = function (models) {
    Batch.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    Batch.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });
  };
  return Batch;
};
