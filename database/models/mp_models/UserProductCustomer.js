'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserProductCustomer = sequelize.define('UserProductCustomer', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    customerId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    discountProgramId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
  }, {
    tableName: 'user_product_customers',
    timestamps: false
  });

  UserProductCustomer.associate = function (models) {
    // associations can be defined here
    UserProductCustomer.belongsTo(models.Customer, {
      as: 'customer',
      foreignKey: 'customerId',
      targetKey: 'id',
    });

    UserProductCustomer.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
      targetKey: 'id',
    });

    UserProductCustomer.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId',
      targetKey: 'id',
    });
  };

  return UserProductCustomer;
};
