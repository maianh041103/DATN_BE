'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    amount: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
    totalAmount: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
    customerId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    createdBy: {
      allowNull: false,
      type: DataTypes.INTEGER(11).UNSIGNED,
    },
    orderId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    paymentMethod: {
      allowNull: true,
      type: DataTypes.ENUM("CASH", "BANK", "DEBT")
    },
    status: {
      allowNull: true,
      type: DataTypes.STRING
    },
    isReturn: {
      allowNull: true,
      type: DataTypes.BOOLEAN
    },
    transactionId: {
      allowNull: true,
      type: DataTypes.INTEGER(11).UNSIGNED
    },
    supplierId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    inboundId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    paranoid: true,
  });

  Payment.associate = function (models) {
    // associations can be defined here
    Payment.belongsTo(models.Customer, {
      as: 'customer',
      foreignKey: 'customerId',
      targetKey: 'id',
    });
    Payment.belongsTo(models.Order, {
      as: 'order',
      foreignKey: 'orderId',
      targetKey: 'id',
    });
    Payment.belongsTo(models.User, {
      as: 'fullnameCreator',
      foreignKey: 'createdBy',
      targetKey: 'id',
    });
    Payment.belongsTo(models.Supplier, {
      as: 'supplier',
      foreignKey: 'supplierId',
      targetKey: 'id',
    });
    Payment.belongsTo(models.Inbound, {
      as: 'inbound',
      foreignKey: 'inboundId',
      targetKey: 'id',
    });
  };

  return Payment;
};
