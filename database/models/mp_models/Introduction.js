'use strict';
module.exports = (sequelize, Sequelize) => {
  const Introduction = sequelize.define('Introduction', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    content: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    description: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    prioritize: {
      allowNull: true,
      type: Sequelize.INTEGER(1).UNSIGNED,
      defaultValue: 0,
    },
    status: {
      allowNull: true,
      type: Sequelize.INTEGER(1).UNSIGNED,
      defaultValue: 1,
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
    tableName: 'introductions',
    timestamps: false
  });

  return Introduction;
};
