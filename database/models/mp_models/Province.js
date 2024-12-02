'use strict';
module.exports = (sequelize, DataTypes) => {
  const Province = sequelize.define('Province', {
    id: {
      type: DataTypes.INTEGER(2).UNSIGNED,
      primaryKey: true,
    },
    vemisId: {
      type: DataTypes.STRING,
    },
    vemisName: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    name2: {
      type: DataTypes.STRING,
    },
    sname: {
      type: DataTypes.STRING,
    },
    dataArea: {
      type: DataTypes.INTEGER(2).UNSIGNED,
    },
    economicZone: {
      type: DataTypes.INTEGER(2).UNSIGNED,
    },
    keyword: {
      type: DataTypes.STRING,
    },
    displayOrder: {
      type: DataTypes.INTEGER(2).UNSIGNED,
    },
    masterId: {
      type: DataTypes.INTEGER(20).UNSIGNED,
    },
    name3: {
      type: DataTypes.STRING,
    },
    regionId: {
      type: DataTypes.INTEGER(4).UNSIGNED,
    },
    mainEthnicGroup: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'provinces',
    timestamps: false
  });
  Province.associate = function (models) {
    // associations can be defined here
    Province.hasMany(models.District, {
      as: 'districts',
      foreignKey: 'provinceId',
      sourceKey: 'id',
    });
  };
  return Province;
};
