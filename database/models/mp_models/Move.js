'use strict';
module.exports = (sequelize, DataTypes) => {
  const Move = sequelize.define('Move', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fromBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    toBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    movedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    movedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    receivedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    note: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    receiveNote: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    totalItem: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    storeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'moves',
    timestamps: true,
  });
  Move.associate = function (models) {
    Move.belongsTo(models.Branch, {
      as: "fromBranch",
      foreignKey: "fromBranchId",
      targetKey: "id",
    });
    Move.belongsTo(models.Branch, {
      as: "toBranch",
      foreignKey: "toBranchId",
      targetKey: "id",
    });
    Move.hasMany(models.MoveItem, {
      as: "items",
      foreignKey: 'moveId',
      sourceKey: "id",
    });
    Move.belongsTo(models.User, {
      as: "movedByUser",
      foreignKey: "movedBy",
      targetKey: "id",
    });
    Move.belongsTo(models.User, {
      as: "receivedByUser",
      foreignKey: 'receivedBy',
      sourceKey: "id",
    })
  };
  return Move;
};
