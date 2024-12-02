'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderHistory = sequelize.define('OrderHistory', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    action: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(11).UNSIGNED,
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    tableName: 'order_histories',
    timestamps: false
  });

  OrderHistory.associate = function (models) {
    // associations can be defined here
  };

  return OrderHistory;
};
