'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ward = sequelize.define('Ward', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vemisProvince: {
      type: DataTypes.STRING,
    },
    vemisDistrict: {
      type: DataTypes.STRING,
    },
    vemisWard: {
      type: DataTypes.STRING,
    },
    geographicalAreaId: {
      type: DataTypes.STRING,
    },
    vemisName: {
      type: DataTypes.STRING,
    },
    difficult: {
      type: DataTypes.INTEGER(4).UNSIGNED,
    },
    border: {
      type: DataTypes.INTEGER(4).UNSIGNED,
    },
    hspcArea: {
      type: DataTypes.DOUBLE,
    },
    name: {
      type: DataTypes.STRING,
    },
    name2: {
      type: DataTypes.STRING,
    },
    provinceId: {
      type: DataTypes.INTEGER(2).UNSIGNED,
    },
    districtId: {
      type: DataTypes.INTEGER(5).UNSIGNED,
    },
    province: {
      type: DataTypes.STRING,
    },
    district: {
      type: DataTypes.STRING,
    },
    name3: {
      type: DataTypes.STRING,
    },
    border1: {
      type: DataTypes.INTEGER(4).UNSIGNED,
    },
    hspcArea1: {
      type: DataTypes.DOUBLE,
    },
    difficult1: {
      type: DataTypes.INTEGER(4).UNSIGNED,
    },
    geographicalAreaId1: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'wards',
    timestamps: false
  });

  Ward.associate = function (models) {
    // associations can be defined here
    Ward.belongsTo(models.District, {
      as: 'districts',
      foreignKey: 'districtId',
      targetKey: 'id',
    });
  };

  return Ward;
};
