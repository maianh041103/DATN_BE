"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Configuration = sequelize.define(
    "Configuration",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValues: 0
      },
      displayOrder: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      status: {
        allowNull: true,
        type: DataTypes.INTEGER(1).UNSIGNED,
        defaultValues: 0,
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
      tableName: "configurations",
      timestamps: true,
      paranoid: true,
    }
  );

  Configuration.associate = function (models) {};

  return Configuration;
};
