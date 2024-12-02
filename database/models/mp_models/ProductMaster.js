'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProductMaster = sequelize.define('ProductMaster', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storeId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    branchId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    productUnitId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.DOUBLE(11, 2).UNSIGNED,
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
    tableName: 'product_masters',
    timestamps: true,
    paranoid: true,
  });
  ProductMaster.associate = function (models) {
    ProductMaster.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    ProductMaster.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    ProductMaster.belongsTo(models.Product, {
      as: "product",
      foreignKey: "productId",
      targetKey: "id",
    });

    ProductMaster.belongsTo(models.ProductUnit, {
      as: "productUnit",
      foreignKey: "productUnitId",
      targetKey: "id",
    });
  };
  return ProductMaster;
};
