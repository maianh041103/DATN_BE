"use strict";

const {
  orderStatuses,
  orderHistoryStatus,
} = require("../../../src/mpModules/order/orderConstant");

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      groupCustomerId: {
        allowNull: true,
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
      prescriptionId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      totalPrice: {
        allowNull: false,
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
      },
      cashOfCustomer: {
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
      },
      refund: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      customerOwes: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      discount: {
        allowNull: true,
        type: DataTypes.FLOAT(11, 2).UNSIGNED,
        defaultValues: 0.0,
      },
      discountType: {
        allowNull: true,
        type: DataTypes.INTEGER(1).UNSIGNED,
      },
      discountAmount: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValues: 0.0,
      },
      discountOrder: { //giá giảm do khuyến mãi hóa đơn
        allowNull: true,
        type: DataTypes.INTEGER(1).UNSIGNED,
      },
      point: {
        allowNull: true,
        type: DataTypes.FLOAT(11, 2).UNSIGNED,
        defaultValue: 0.0,
      },
      paymentType: {
        allowNull: false,
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
          orderStatuses.DRAFT,
          orderStatuses.PENDING,
          orderStatuses.CONFIRMING,
          orderStatuses.SHIPPING,
          orderStatuses.DELIVERING,
          orderStatuses.PAID,
          orderStatuses.CANCELLED,
          orderStatuses.SUCCEED
        ),
        defaultValue: orderStatuses.PENDING,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      updatedBy: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      canReturn: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      paymentPoint: {
        allowNull: true,
        type: DataTypes.INTEGER(15).UNSIGNED,
        defaultValue: 0
      },
      discountByPoint: {
        allowNull: true,
        type: DataTypes.INTEGER(15).UNSIGNED,
        defaultValue: 0
      },
      marketOrderId:{
        allowNull: true,
        type: DataTypes.INTEGER(15).UNSIGNED,
      }
    },
    {
      tableName: "orders",
      timestamps: true,
      paranoid: true,
      hooks: {
        afterCreate: function (instance, options) {
          const orderHistory = {
            orderId: instance.id,
            description: "",
            action: orderHistoryStatus.CREATE,
            createdBy: instance.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          switch (instance.status) {
            case orderStatuses.PENDING:
              orderHistory.description = `Tạo đơn hàng ${instance.code}`;
              break;
          }
          sequelize.models.OrderHistory.create(orderHistory);
        },
        afterUpdate: function (instance, options) {
          const orderHistory = {
            orderId: instance.id,
            description: "",
            action: orderHistoryStatus.UPDATE,
            updatedBy: instance.updatedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          switch (instance.status) {
            case orderStatuses.SHIPPING:
              orderHistory.description = `Đang chuyển hàng đơn hàng ${instance.code}`;
              break;
            case orderStatuses.DELIVERING:
              orderHistory.description = `Đã giao hàng đơn hàng ${instance.code}`;
              break;
            case orderStatuses.PAID:
              orderHistory.description = `Đã thanh toán đơn hàng ${instance.code}`;
              break;
            case orderStatuses.CANCELLED:
              orderHistory.description = `Hủy đơn hàng ${instance.code}`;
              break;
            case orderStatuses.SUCCEED:
              orderHistory.description = `Xác nhận đơn hàng thành công ${instance.code}`;
              break;
          }

          sequelize.models.OrderHistory.create(orderHistory);
        },
      },
    }
  );
  Order.associate = function (models) {
    Order.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });

    Order.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    Order.belongsTo(models.Prescription, {
      as: "prescription",
      foreignKey: "prescriptionId",
      targetKey: "id",
    });

    Order.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
      targetKey: "id",
    });

    Order.belongsTo(models.User, {
      as: "updater",
      foreignKey: "updatedBy",
      targetKey: "id",
    });

    Order.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdBy",
      targetKey: "id",
    });

    Order.belongsTo(models.Customer, {
      as: "customer",
      foreignKey: "customerId",
      targetKey: "id",
    });

    Order.hasMany(models.OrderProduct, {
      as: "orderProducts",
      foreignKey: "orderId",
      sourceKey: "id",
    });
    Order.hasMany(models.SaleReturn, {
      as: "saleReturn",
      foreignKey: "orderId",
      sourceKey: "id",
    });
    Order.hasMany(models.OrderLog, {
      as: "orderLogs",
      foreignKey: "orderId",
      sourceKey: "id",
    });
  };
  return Order;
};
