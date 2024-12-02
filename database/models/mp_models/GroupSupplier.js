'use strict';
module.exports = (sequelize, DataTypes) => {
  const GroupSupplier = sequelize.define('GroupSupplier', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storeId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    branchId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    }
  }, {
    tableName: 'group_suppliers',
    timestamps: true,
    paranoid: true,
  });
  GroupSupplier.associate = function (models) {
  };
  return GroupSupplier;
};
