'use strict';
module.exports = (sequelize, DataTypes) => {
  const CountryProduce = sequelize.define('CountryProduce', {
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
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    }
  }, {
    tableName: 'countries',
    timestamps: true,
    paranoid: true,
  });
  CountryProduce.associate = function (models) {
  };
  return CountryProduce;
};
