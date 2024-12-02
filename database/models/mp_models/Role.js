'use strict';
module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    storeId: {
      allowNull: false,
      type: Sequelize.INTEGER(11).UNSIGNED,
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
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE
    }
  }, {
    tableName: 'roles'
  });
  Role.associate = function (models) {
    // associations can be defined here
    Role.hasMany(models.User, {
      as: 'users',
      foreignKey: 'roleId',
      sourceKey: 'id',
    });
    Role.hasMany(models.RolePermission, {
      as: 'permissions',
      foreignKey: 'roleId',
      sourceKey: 'id',
    });
    Role.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });
  };
  return Role;
};
