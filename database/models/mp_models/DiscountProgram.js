"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const DiscountProgram = sequelize.define(
    "DiscountProgram",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageId: {
        allowNull: false,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      productId: {
        allowNull: false,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      discountPrice: {
        allowNull: false,
        type: DataTypes.FLOAT(11, 2).UNSIGNED,
        defaultValue: 0.0,
      },
      link: {
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
        defaultValues: 1,
      },
      startTime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      endTime: {
        allowNull: false,
        type: Sequelize.DATE,
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
      tableName: "discount_programs",
      timestamps: false,
    }
  );

  DiscountProgram.associate = function (models) {};

  return DiscountProgram;
};
