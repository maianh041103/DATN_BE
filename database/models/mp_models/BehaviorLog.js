"use strict";
module.exports = (sequelize, DataTypes) => {
  const BehaviorLog = sequelize.define(
    "BehaviorLog",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      accountId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
      },
      type: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
      },
      objectId: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      action: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      data: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      isProcess: {
        type: DataTypes.INTEGER(1).UNSIGNED,
        allowNull: true,
        default: 0,
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "behavior_logs",
      timestamps: false,
    }
  );

  BehaviorLog.associate = function (models) {
    BehaviorLog.belongsTo(models.Customer, {
      as: "customer",
      foreignKey: "accountId",
      targetKey: "id",
    });
    BehaviorLog.belongsTo(models.User, {
      as: "user",
      foreignKey: "accountId",
      targetKey: "id",
    });
  };

  return BehaviorLog;
};
