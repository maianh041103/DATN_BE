'use strict';
module.exports = (sequelize, Sequelize) => {
  const ProductCategory = sequelize.define('ProductCategory', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    slug: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    order: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
      defaultValue: 0,
    },
    imageId: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    storeId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    createdBy: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    createdAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE
    }
  }, {
    tableName: 'product_categories',
    timestamps: false
  });

  return ProductCategory;
};
