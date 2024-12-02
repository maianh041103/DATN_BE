'use strict';
module.exports = (sequelize, Sequelize) => {
  const ProductStatistic = sequelize.define('ProductStatistic', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    productId: {
      allowNull: false,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    viewed: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
      defaultValue: 0,
    },
    sold: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
      defaultValue: 0,
    },
  }, {
    tableName: 'product_statistics',
    timestamps: false
  });

  return ProductStatistic;
};
