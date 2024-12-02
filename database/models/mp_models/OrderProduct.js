"use strict";
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const OrderProduct = sequelize.define(
    "OrderProduct",
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
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
      productUnitData: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER(5).UNSIGNED,
      },
      quantityBaseUnit: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      comboId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      /* Chỉ thêm vào giỏ hàng chưa chốt đặt thì trường giá để trống
      Sau khi đã đặt hàng thành công, thì điền giá cuối cùng vào
    */
      price: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      //Giá bán sau khi áp khuyến mãi
      itemPrice: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      discountPrice: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED
      },
      //Có phải là hàng khuyến mãi không
      isDiscount: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Giá vốn trên đơn vị cơ bản
      primePrice: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Khách hàng
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Nhóm khách hàng
      groupCustomerId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Người bán hàng
      userId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      discount: {
        allowNull: true,
        type: DataTypes.FLOAT(),
        defaultValues: 0,
      },
      quantityLast: {
        allowNull: true,
        type: DataTypes.INTEGER(5).UNSIGNED,
      },
      //Điểm tích của mỗi sản phẩm
      point: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
        default: 0
      },
      marketOrderProductId: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      }
    },
    {
      tableName: "order_products",
      timestamps: true,
      paranoid: true,
    }
  );

  OrderProduct.associate = function (models) {
    // associations can be defined here
    OrderProduct.belongsTo(models.Order, {
      as: "order",
      foreignKey: "orderId",
      targetKey: "id",
    });

    OrderProduct.belongsTo(models.Product, {
      as: "product",
      foreignKey: "productId",
      targetKey: "id",
    });

    OrderProduct.belongsTo(models.Customer, {
      as: "customer",
      foreignKey: "customerId",
      targetKey: "id",
    });

    OrderProduct.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
      targetKey: "id",
    });

    OrderProduct.belongsTo(models.ProductUnit, {
      as: "productUnit",
      foreignKey: "productUnitId",
      targetKey: "id",
    });

    OrderProduct.hasMany(models.OrderProductBatch, {
      as: "batches",
      foreignKey: "orderProductId",
      sourceKey: "id",
    });
  };
  return OrderProduct;
};
