'use strict';
module.exports = (sequelize, DataTypes) => {
  const WorkPlace = sequelize.define('WorkPlace', {
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
    tableName: 'work_places',
    timestamps: true,
    paranoid: true,
  });
  WorkPlace.associate = function (models) {
  };
  return WorkPlace;
};
