"use strict";


const { SaleReturnStatus } = require("../../../src/mpModules/saleReturn/constant");
module.exports = (sequelize, DataTypes) => {
  const SaleReturn = sequelize.define(
    "SaleReturn",
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
      orderId: {
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
      customerId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Tổng tiền
      totalPrice: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      description: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Giảm giá
      discount: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      returnFee: {
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
      paid: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      paymentType: {
        allowNull: true,
        type: DataTypes.ENUM("CASH", "BANK", "DEBT"),
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM(
          SaleReturnStatus.TRASH,
          SaleReturnStatus.SUCCEED
        ),
        defaultValue: SaleReturnStatus.SUCCEED,
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
      tableName: "sale_returns",
      timestamps: true,
      paranoid: true,
    }
  );
  SaleReturn.associate = function (models) {
    SaleReturn.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });
    SaleReturn.belongsTo(models.Order, {
      as: "order",
      foreignKey: "orderId",
      targetKey: "id",
    });
    SaleReturn.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    SaleReturn.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
      targetKey: "id",
    });

    SaleReturn.belongsTo(models.User, {
      as: "updater",
      foreignKey: "updatedBy",
      targetKey: "id",
    });

    SaleReturn.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdBy",
      targetKey: "id",
    });

    SaleReturn.belongsTo(models.Customer, {
      as: "customer",
      foreignKey: "customerId",
      targetKey: "id",
    });

    SaleReturn.hasMany(models.SaleReturnItem, {
      as: "items",
      foreignKey: "saleReturnId",
      sourceKey: "id"
    })
  };
  return SaleReturn;
};
