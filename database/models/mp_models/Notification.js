"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      customerId: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      parentId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      iconId: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isRead: {
        allowNull: true,
        type: DataTypes.INTEGER(1).UNSIGNED,
        defaultValues: 0,
      },
      objectId: {
        allowNull: true,
        type: DataTypes.INTEGER(1).UNSIGNED,
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
      tableName: "notifications",
      timestamps: false,
    }
  );

  Notification.associate = function (models) {
    Notification.belongsTo(models.Icon, {
      as: "icon",
      foreignKey: "iconId",
      targetKey: "id",
    });

    Notification.belongsTo(models.Customer, {
      as: "customer",
      foreignKey: "customerId",
      targetKey: "id",
    });

    Notification.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
      targetKey: "id",
    });
  };

  return Notification;
};
