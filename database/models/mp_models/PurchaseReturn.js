"use strict";
const {
  purchaseReturnStatus,
} = require("../../../src/mpModules/purchaseReturn/purchaseReturnConstant");

module.exports = (sequelize, DataTypes) => {
  const PurchaseReturn = sequelize.define(
    "PurchaseReturn",
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      storeId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      branchId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Người xác nhận trả hàng
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      supplierId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Tổng tiền
      totalPrice: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      // Giảm giá
      discount: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      // Đã trả
      paid: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      // Công nợ
      debt: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      paymentType: {
        allowNull: true,
        type: DataTypes.ENUM("CASH", "BANK", "DEBT"),
      },
      // Mô tả
      description: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Hóa đơn đỏ
      isVatInvoice: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM(
          purchaseReturnStatus.TRASH,
          purchaseReturnStatus.DRAFT,
          purchaseReturnStatus.SUCCEED
        ),
        defaultValue: purchaseReturnStatus.DRAFT,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
    },
    {
      tableName: "purchase_returns",
      timestamps: true,
      paranoid: true,
    }
  );
  PurchaseReturn.associate = function (models) {
    PurchaseReturn.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });

    PurchaseReturn.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    PurchaseReturn.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
      targetKey: "id",
    });

    PurchaseReturn.belongsTo(models.User, {
      as: "updater",
      foreignKey: "updatedBy",
      targetKey: "id",
    });

    PurchaseReturn.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdBy",
      targetKey: "id",
    });

    PurchaseReturn.belongsTo(models.Supplier, {
      as: "supplier",
      foreignKey: "supplierId",
      targetKey: "id",
    });

    PurchaseReturn.hasMany(models.PurchaseReturnToProduct,{
        as:"products",
        foreignKey: "purchaseReturnId",
        sourceKey:"id"
    })
  };
  return PurchaseReturn;
};
