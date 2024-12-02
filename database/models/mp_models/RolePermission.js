"use strict";
module.exports = (sequelize, Sequelize) => {
  const RolePermission = sequelize.define(
    "RolePermission",
    {
      id: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      roleId: {
        allowNull: false,
        type: Sequelize.INTEGER(11).UNSIGNED,
      },
      model: {
        allowNull: false,
        type: Sequelize.STRING(255),
      },
      action: {
        allowNull: false,
        type: Sequelize.ENUM(
          "read",
          "create",
          "update",
          "delete",
          "view_all",
          "upload",
          "download"
        ),
      },
      createdBy: {
        allowNull: true,
        type: Sequelize.INTEGER(11).UNSIGNED,
      },
      updatedBy: {
        allowNull: true,
        type: Sequelize.INTEGER(11).UNSIGNED,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    },
    {
      tableName: "role_permissions",
    }
  );
  RolePermission.associate = function (models) {
    // associations can be defined here
    RolePermission.belongsTo(models.Role, {
      as: "role",
      foreignKey: "roleId",
      targetKey: "id",
    });
  };
  return RolePermission;
};
