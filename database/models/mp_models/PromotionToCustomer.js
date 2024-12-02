'use strict';
module.exports = (sequelize, DataTypes) => {
  const PromotionToCustomer = sequelize.define('PromotionToCustomer', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
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
    tableName: 'promotion_to_customers',
    timestamps: false
  });

  PromotionToCustomer.associate = function (models) {
    // associations can be defined here
    PromotionToCustomer.belongsTo(models.PromotionProgram, {
      as: 'promotion_to_customer',
      foreignKey: 'promotionId',
      targetKey: 'id',
    });
  };

  return PromotionToCustomer;
};
