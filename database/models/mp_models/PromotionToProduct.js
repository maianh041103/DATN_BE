'use strict';
module.exports = (sequelize, DataTypes) => {
  const PromotionToProduct = sequelize.define('PromotionToProduct', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    promotionId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    createdBy: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    tableName: 'promotion_to_products',
    timestamps: false
  });

  PromotionToProduct.associate = function (models) {
    // associations can be defined here
  };

  return PromotionToProduct;
};
