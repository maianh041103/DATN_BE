'use strict';
module.exports = (sequelize, DataTypes) => {
  const GroupCustomer = sequelize.define('GroupCustomer', {
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
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    discount: {
      allowNull: true,
      type: DataTypes.INTEGER(3).UNSIGNED,
      defaultValues: 0
    },
    type: {
      allowNull: true,
      type: DataTypes.STRING
    },
    createdBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
  }, {
    tableName: 'group_customers',
    timestamps: true,
    paranoid: true,
  });
  GroupCustomer.associate = function (models) {
    // associations can be defined here
    GroupCustomer.hasMany(models.Customer, {
      as: 'customers',
      foreignKey: 'groupCustomerId',
      sourceKey: 'id',
    });
  };
  return GroupCustomer;
};
