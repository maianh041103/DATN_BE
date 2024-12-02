'use strict';
module.exports = (sequelize, Sequelize) => {
  const WarehouseCard = sequelize.define('WarehouseCard', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code: {
      allowNull: true,
      type: Sequelize.STRING
    },
    productId: {
      allowNull: false,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    productUnitId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    branchId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    partner: {
      allowNull: true,
      type: Sequelize.STRING
    },
    changeQty: {
      allowNull: true,
      type: Sequelize.INTEGER,
    },
    remainQty: {
      allowNull: true,
      type: Sequelize.INTEGER,
    },
    // 1. Ban hang , 2. Nhap hang,  3. Kiem kho
    type: {
      allowNull: false,
      type: Sequelize.INTEGER(1).UNSIGNED,
    },
    createdAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
  }, {
    tableName: 'warehouse_card',
    timestamps: false
  }
  );
  WarehouseCard.associate = function (models) {
    WarehouseCard.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });
    WarehouseCard.belongsTo(models.ProductUnit, {
      as: "productUnit",
      foreignKey: "productUnitId",
      targetKey: "id",
    });
  }
  return WarehouseCard
};
