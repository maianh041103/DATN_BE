"use strict";
const {
  inboundStatus,
} = require("../../../src/mpModules/inbound/inboundConstant");

module.exports = (sequelize, DataTypes) => {
  const Inbound = sequelize.define(
    "Inbound",
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
      // Người nhập hàng
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
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
      },
      // Giảm giá
      discount: {
        allowNull: true,
        type: DataTypes.INTEGER(20).UNSIGNED,
        defaultValue: 0,
      },
      // Đã trả
      paid: {
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
      },
      // Công nợ
      debt: {
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
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
        type: DataTypes.ENUM(inboundStatus.TRASH, inboundStatus.DRAFT, inboundStatus.SUCCEED),
        defaultValue: inboundStatus.DRAFT,
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
      tableName: "inbounds",
      timestamps: true,
      paranoid: true,
    }
  );
  Inbound.associate = function (models) {
    Inbound.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });

    Inbound.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    Inbound.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
      targetKey: "id",
    });

    Inbound.belongsTo(models.User, {
      as: "updater",
      foreignKey: "updatedBy",
      targetKey: "id",
    });

    Inbound.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdBy",
      targetKey: "id",
    });

    Inbound.belongsTo(models.Supplier, {
      as: "supplier",
      foreignKey: "supplierId",
      targetKey: "id",
    });

    Inbound.hasMany(models.InboundToProduct, {
      as: "inboundProducts",
      foreignKey: "inboundId",
      sourceKey: "id",
    });

    // Inbound.belongsToMany(models.Product, {
    //   as: 'products',
    //   through: models.InboundProduct,
    //   foreignKey: 'inboundId',
    //   otherKey: 'productId',
    // });
  };
  return Inbound;
};
