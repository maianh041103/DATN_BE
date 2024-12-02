'use strict';
module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storeId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    branchId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    doctorId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    healthFacilityId: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
    },
    // Mã đơn thuốc
    code: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    // Tên bệnh nhân
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      defaultValue: "other",
    },
    age: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    weight: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    identificationCard: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    healthInsuranceCard: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    address: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    // Người giám hộ
    supervisor: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    phone: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    // Chuẩn đoán 
    diagnostic: {
      allowNull: true,
      type: DataTypes.STRING,
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
    tableName: 'prescriptions',
    timestamps: true,
    paranoid: true,
  });
  Prescription.associate = function (models) {
    Prescription.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    Prescription.belongsTo(models.Branch, {
      as: 'branch',
      foreignKey: 'branchId',
      targetKey: 'id',
    });

    Prescription.belongsTo(models.Doctor, {
      as: 'doctor',
      foreignKey: 'doctorId',
      targetKey: 'id',
    });

    Prescription.belongsTo(models.HealthFacility, {
      as: 'healthFacility',
      foreignKey: 'healthFacilityId',
      targetKey: 'id',
    });
  };
  return Prescription;
};
