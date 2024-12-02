'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserProduct = sequelize.define('UserProduct', {
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
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    tableName: 'user_products',
    timestamps: false
  });

  UserProduct.associate = function (models) {
    // associations can be defined here
  };

  return UserProduct;
};
