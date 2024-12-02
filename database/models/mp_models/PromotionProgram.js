"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const PromotionProgram = sequelize.define(
    "PromotionProgram",
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
      slug: {
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
      tableName: "promotion_programs",
      timestamps: false,
    }
  );

  PromotionProgram.associate = function (models) {
    PromotionProgram.belongsTo(models.Image, {
      as: "image",
      foreignKey: "imageId",
      targetKey: "id",
    });

    PromotionProgram.belongsToMany(models.Product, {
      as: "products",
      through: models.PromotionToProduct,
      foreignKey: "promotionId",
      otherKey: "productId",
    });

    PromotionProgram.belongsToMany(models.Customer, {
      as: "customers",
      through: models.PromotionToCustomer,
      foreignKey: "promotionId",
      otherKey: "customerId",
    });
  };

  return PromotionProgram;
};
