'use strict';
const config = require('config');
const apiServer = config.get('api.apiServer') || '';

module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    originalName: {
      allowNull: true,
      type: DataTypes.STRING
    },
    path: {
      allowNull: false,
      type: DataTypes.STRING
    },
    filePath: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${apiServer}${this.getDataValue('path')}`;
      },
    },
    fileName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    extension: {
      allowNull: true,
      type: DataTypes.STRING
    },
    mimetype: {
      allowNull: true,
      type: DataTypes.STRING
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
  }, {
    tableName: 'images'
  });

  Image.associate = function (models) {
    // associations can be defined here
  };
  
  return Image;
};
