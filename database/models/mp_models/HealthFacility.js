'use strict';
module.exports = (sequelize, DataTypes) => {
  const HealthFacility = sequelize.define('HealthFacility', {
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
    tableName: 'health_facilities',
    timestamps: true,
    paranoid: true,
  });
  HealthFacility.associate = function (models) {
  };
  return HealthFacility;
};
