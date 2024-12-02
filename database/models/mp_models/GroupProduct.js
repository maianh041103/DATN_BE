'use strict';
module.exports = (sequelize, DataTypes) => {
  const GroupProduct = sequelize.define('GroupProduct', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storeId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    discount: {
      allowNull: true,
      type: DataTypes.INTEGER(3).UNSIGNED,
      defaultValues: 0
    },
    type: {
      allowNull: true,
      type: DataTypes.STRING
    }
  }, {
    tableName: 'group_products',
    timestamps: true,
    paranoid: true,
  });
  GroupProduct.associate = function (models) {
    // associations can be defined here
    GroupProduct.hasMany(models.Product, {
      as: 'products',
      foreignKey: 'groupProductId',
      sourceKey: 'id',
    });
  };
  return GroupProduct;
};
