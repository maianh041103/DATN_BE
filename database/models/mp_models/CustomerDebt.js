'use strict';
module.exports = (sequelize, DataTypes) => {
  const CustomerDebt = sequelize.define('CustomerDebt', {
    id: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      primaryKey: true,
    },
    totalAmount: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    customerId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    orderId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    debtAmount: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    tableName: 'customer_debts',
    timestamps: true,
    paranoid: true,
  });

  CustomerDebt.associate = function (models) {
    // associations can be defined here
    CustomerDebt.belongsTo(models.Customer, {
      as: 'customer',
      foreignKey: 'customerId',
      targetKey: 'id',
    });
    CustomerDebt.belongsTo(models.Order, {
      as: 'order',
      foreignKey: 'orderId',
      targetKey: 'id',
    });
  };

  return CustomerDebt;
};
