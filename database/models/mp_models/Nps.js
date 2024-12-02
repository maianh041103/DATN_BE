"use strict";
module.exports = (sequelize, Sequelize) => {
  const Nps = sequelize.define(
    "Nps",
    {
      id: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      storeId: {
        allowNull: true,
        type: Sequelize.INTEGER(10).UNSIGNED,
      },
      branchId: {
        allowNull: true,
        type: Sequelize.INTEGER(10).UNSIGNED,
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      note: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      status: {
        allowNull: true,
        type: Sequelize.INTEGER(1).UNSIGNED,
        defaultValue: 0,
      },
      isAutoHandle: {
        allowNull: true,
        type: Sequelize.INTEGER(1).UNSIGNED,
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
    },
    {
      tableName: "national_pharmacy_systems",
      timestamps: true,
      paranoid: true,
    }
  );

  Nps.associate = function (models) {
    Nps.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });

    Nps.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    Nps.belongsTo(models.User, {
      as: "updater",
      foreignKey: "updatedBy",
      targetKey: "id",
    });

    Nps.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdBy",
      targetKey: "id",
    });
  };

  return Nps;
};
