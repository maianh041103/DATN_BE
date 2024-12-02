'use strict';
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      allowNull: false,
      type: Sequelize.STRING
    },
    phone: {
      allowNull: true,
      type: Sequelize.STRING
    },
    email: {
      allowNull: true,
      type: Sequelize.STRING
    },
    fullName: {
      allowNull: false,
      type: Sequelize.STRING
    },
    birthday: {
      allowNull: true,
      type: Sequelize.DATE
    },
    gender: {
      type: Sequelize.ENUM('male', 'female', 'other'),
      defaultValue: 'other',
    },
    password: {
      type: Sequelize.STRING(2000)
    },
    avatarId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    position: {
      type: Sequelize.ENUM('staff', 'management', 'admin'),
      defaultValue: 'staff',
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('draft', 'active', 'inactive'),
      defaultValue: 'active',
    },
    roleId: {
      allowNull: false,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    storeId: {
      allowNull: false,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    branchId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    address: {
      allowNull: true,
      type: Sequelize.STRING
    },
    isAdmin: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    lastLoginAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    createdAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE
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
      type: Sequelize.DATE
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
  });
  User.associate = function (models) {
    User.belongsTo(models.Role, {
      as: 'role',
      foreignKey: 'roleId',
      targetKey: 'id',
    });
    User.belongsTo(models.Image, {
      as: 'avatar',
      foreignKey: 'avatarId',
      targetKey: 'id',
    });
    User.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });
    User.belongsTo(models.Branch, {
      as: 'branch',
      foreignKey: 'branchId',
      targetKey: 'id',
    });
    User.hasMany(models.UserBranch, {
      as: "branches",
      foreignKey: 'userId',
      sourceKey: 'id'
    })
  };
  return User;
};
