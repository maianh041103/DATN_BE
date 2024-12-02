"use strict";
module.exports = (sequelize, Sequelize) => {
  const MedicationCategory = sequelize.define(
    "MedicationCategory",
    {
      id: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      link: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      registerNumber: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      // Hoạt chất
      activeElement: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      // Hàm lượng
      content: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      // Hãng sản xuất
      manufactureId: {
        allowNull: true,
        type: Sequelize.INTEGER(10).UNSIGNED,
      },
      // Nước sản xuất
      countryId: {
        allowNull: true,
        type: Sequelize.INTEGER(10).UNSIGNED,
      },
      // Đơn vị
      unitId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      // Quy cách đóng gói
      packingSpecification: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      storeId: {
        allowNull: true,
        type: Sequelize.INTEGER(11).UNSIGNED,
      },
      createdBy: {
        allowNull: true,
        type: Sequelize.INTEGER(11).UNSIGNED,
      },
      updatedBy: {
        allowNull: true,
        type: Sequelize.INTEGER(11).UNSIGNED,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    },
    {
      tableName: "medication_categories",
      timestamps: true,
      paranoid: true,
    }
  );
  MedicationCategory.associate = function (models) {
    MedicationCategory.belongsTo(models.Store, {
      as: "store",
      foreignKey: "storeId",
      targetKey: "id",
    });
    MedicationCategory.belongsTo(models.Manufacture, {
      as: "manufacture",
      foreignKey: "manufactureId",
      targetKey: "id",
    });
    MedicationCategory.belongsTo(models.CountryProduce, {
      as: "country",
      foreignKey: "countryId",
      targetKey: "id",
    });
    MedicationCategory.belongsTo(models.Unit, {
      as: "unit",
      foreignKey: "unitId",
      targetKey: "id",
    });
  };

  return MedicationCategory;
};
