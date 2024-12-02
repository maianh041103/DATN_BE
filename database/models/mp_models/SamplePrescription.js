'use strict';
module.exports = (sequelize, Sequelize) => {
  const SamplePrescription = sequelize.define('SamplePrescription', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    storeId: {
      allowNull: false,
      type: Sequelize.INTEGER(10).UNSIGNED,
    },
    branchId: {
      allowNull: false,
      type: Sequelize.INTEGER(10).UNSIGNED,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    // Mã đơn thuốc
    code: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    // Vị trí
    positionId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    // Trọng lượng
    weight: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    // Ghi chú
    description: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    displayOrder: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
      defaultValue: 0,
    },
    // Trạng thái áp dụng - chưa áp dụng
    status: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
      defaultValue: 1,
    },
    imageId: {
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
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE
    }
  }, {
    tableName: 'sample_prescriptions',
    timestamps: true,
    paranoid: true,
  });

  SamplePrescription.associate = function (models) {
    SamplePrescription.belongsTo(models.Image, {
      as: 'image',
      foreignKey: 'imageId',
      targetKey: 'id',
    });

    SamplePrescription.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    SamplePrescription.belongsTo(models.Branch, {
      as: "branch",
      foreignKey: "branchId",
      targetKey: "id",
    });

    SamplePrescription.belongsTo(models.Position, {
      as: "position",
      foreignKey: "positionId",
      targetKey: "id",
    });

    SamplePrescription.belongsTo(models.User, {
      as: "user",
      foreignKey: "createdBy",
      targetKey: "id",
    });
  };

  return SamplePrescription;
};
