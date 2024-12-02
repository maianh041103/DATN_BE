"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Manufacture = sequelize.define(
    "Manufacture",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      storeId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "manufactures",
      timestamps: true,
      paranoid: true,
    }
  );

  Manufacture.associate = function (models) {};

  return Manufacture;
};
