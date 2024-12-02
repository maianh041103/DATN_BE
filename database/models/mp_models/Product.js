"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      // Tên viết tắt
      shortName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      slug: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      // Mã hàng
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      // Mã vạch
      barCode: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      // Mã thuốc
      drugCode: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      // Nhóm sản phẩm
      groupProductId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      imageId: {
        allowNull: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
        imageUrl:{
          allowNull: true,
            type: DataTypes.STRING,
        },
      // Đường dùng
      dosageId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Vị trí
      positionId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Giá vốn
      primePrice: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0
      },
      // Giá bán
      price: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Trọng lượng
      weight: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Cảnh báo ngày hết hạn date
      warningExpiryDate: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      // Cảnh báo ngày hết hạn text
      warningExpiryText: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Số ngày hết hạn 
      expiryPeriod: {
        allowNull: null,
        type: DataTypes.INTEGER(10),
      },
      // Bán trực tiếp
      isDirectSale: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      // Số đăng ký
      registerNumber: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Hoạt chất
      activeElement: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Hàm lượng
      content: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Quy cách đóng gói
      packingSpecification: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Hãng sản xuất
      manufactureId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Nước sản xuất
      countryId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Định mức tồn ít nhất
      minInventory: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Định mức tồn nhiều nhất
      maxInventory: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // Mô tả
      description: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Mẫu ghi chú
      note: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      // Đơn vị cơ bản
      baseUnit: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      // Số lượng tồn kho
      inventory: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      // Số lượng đã bán
      quantitySold: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        defaultValue: 0,
      },
      // Loại sản phẩm
      productCategoryId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      status: {
        allowNull: true,
        type: DataTypes.INTEGER(1).UNSIGNED,
        defaultValue: 1,
      },
      // 1 - Thuốc, 2 - Hàng hóa, 3 - Combo, đóng gói, 4 - Đơn thuốc mẫu
      type: {
        allowNull: false,
        type: DataTypes.INTEGER(1).UNSIGNED,
      },
      storeId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      branchId: {
        allowNull: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      // ========== Hàng hóa 
      // Tích điểm
      isLoyaltyPoint: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      // Có kiểm soát lô cho hàng hóa không?
      isBatchExpireControl: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "products",
      timestamps: true,
      paranoid: true,
    }
  );

  Product.associate = function (models) {
    Product.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });

    Product.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    Product.belongsTo(models.Image, {
      as: "image",
      foreignKey: "imageId",
      targetKey: "id",
    });

    Product.belongsTo(models.Manufacture, {
      as: "productManufacture",
      foreignKey: "manufactureId",
      targetKey: "id",
    });

    Product.belongsTo(models.Dosage, {
      as: 'productDosage',
      foreignKey: 'dosageId',
      targetKey: 'id',
    });

    Product.belongsTo(models.Position, {
      as: 'productPosition',
      foreignKey: 'positionId',
      targetKey: 'id',
    });

    Product.belongsTo(models.CountryProduce, {
      as: 'country',
      foreignKey: 'countryId',
      targetKey: 'id',
    });

    Product.belongsTo(models.GroupProduct, {
      as: "groupProduct",
      foreignKey: "groupProductId",
      targetKey: "id",
    });

    Product.belongsTo(models.ProductCategory, {
      as: "productCategory",
      foreignKey: "productCategoryId",
      targetKey: "id",
    });

    Product.hasMany(models.ProductUnit, {
      as: "productUnit",
      sourceKey: "id",
      targetKey: "productId",
    });

    Product.hasMany(models.Inventory, {
      as: "inventories",
      sourceKey: "id",
      targetKey: "productId",
    });
  };
  return Product;
};
