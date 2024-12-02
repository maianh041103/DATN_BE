"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    "Banner",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      displayOrder: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sponsor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        allowNull: true,
        type: DataTypes.INTEGER(1).UNSIGNED,
        defaultValue: 0,
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
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    },
    {
      tableName: "banners",
      timestamps: false,
    }
  );

  Banner.associate = function (models) {
    Banner.belongsTo(models.Image, {
      as: "image",
      foreignKey: "imageId",
      targetKey: "id",
    });
  };

  return Banner;
};
