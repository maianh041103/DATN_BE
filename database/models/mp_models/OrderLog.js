'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderLog = sequelize.define('OrderLog', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    orderId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    action: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    status: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    oldStatus: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    isProcess: {
      allowNull: true,
      type: DataTypes.INTEGER(1).UNSIGNED,
      defaultValues: 0
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(11).UNSIGNED,
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    tableName: 'orders_log',
    timestamps: false
  });

  OrderLog.associate = function (models) {
    // associations can be defined here
    OrderLog.belongsTo(models.Order, {
      as: 'order',
      foreignKey: 'orderId',
      targetKey: 'id',
    });
    OrderLog.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'createdBy',
      targetKey: 'id',
    });
  };

  return OrderLog;
};
