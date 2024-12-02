'use strict';
module.exports = (sequelize, DataTypes) => {
  const District = sequelize.define('District', {
    id: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      primaryKey: true,
    },
    provinceId: {
      type: DataTypes.INTEGER(2).UNSIGNED,
    },
    vemisProvince: {
      type: DataTypes.STRING,
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
    displayOrder: {
      type: DataTypes.INTEGER(5).UNSIGNED,
    },
    keyword: {
      type: DataTypes.STRING,
    },
    name3: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'districts',
    timestamps: false
  });

  District.associate = function (models) {
    // associations can be defined here
    District.belongsTo(models.Province, {
      as: 'provinces',
      foreignKey: 'provinceId',
      targetKey: 'id',
    });
    District.hasMany(models.Ward, {
      as: 'wards',
      foreignKey: 'districtId',
      sourceKey: 'id',
    });
  };

  return District;
};
