"use strict";
module.exports = (sequelize, DataTypes) => {
  const SamplePrescriptionToProduct = sequelize.define(
    "SamplePrescriptionToProduct",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      samplePrescriptionId: {
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
      // Liều dùng
      dosage: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Số lượng
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      storeId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      branchId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
    },
    {
      tableName: "sample_prescription_to_products",
      timestamps: true,
      paranoid: true,
    }
  );
  SamplePrescriptionToProduct.associate = function (models) {
    SamplePrescriptionToProduct.belongsTo(models.Product, {
      as: "product",
      foreignKey: "productId",
      targetKey: "id",
    });

    SamplePrescriptionToProduct.belongsTo(models.ProductUnit, {
      as: "productUnit",
      foreignKey: "productUnitId",
      targetKey: "id",
    });

    SamplePrescriptionToProduct.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });
  };
  return SamplePrescriptionToProduct;
};
