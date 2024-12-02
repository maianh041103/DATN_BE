'use strict';
module.exports = (sequelize, Sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    quantity: {
      allowNull: false,
      type: Sequelize.INTEGER.UNSIGNED,
    },
    productId: {
      allowNull: false,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    branchId: {
      allowNull: false,
      type: Sequelize.INTEGER(11).UNSIGNED
    }
  }, {
    tableName: 'inventories',
    timestamps: true
  });
  Inventory.associate = function (models) {
    Inventory.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId',
      targetKey: 'id',
    });

    Inventory.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });
  };
  return Inventory;
};
