'use strict';
module.exports = (sequelize, Sequelize) => {
  const Branch = sequelize.define('Branch', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING
    },
    phone: {
      allowNull: false,
      type: Sequelize.STRING
    },
    // Mã chi nhánh
    code: {
      allowNull: true,
      type: Sequelize.STRING
    },
    // Mã bưu điện
    zipCode: {
      allowNull: true,
      type: Sequelize.STRING
    },
    isDefaultBranch: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    storeId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    wardId: {
      allowNull: true,
      type: Sequelize.INTEGER(5).UNSIGNED,
    },
    districtId: {
      allowNull: true,
      type: Sequelize.INTEGER(5).UNSIGNED,
    },
    provinceId: {
      allowNull: true,
      type: Sequelize.INTEGER(2).UNSIGNED,
    },
    address1: {
      allowNull: true,
      type: Sequelize.STRING
    },
    address2: {
      allowNull: true,
      type: Sequelize.STRING
    },
    status: {
      allowNull: false,
      type: Sequelize.INTEGER(1).UNSIGNED,
      defaultValue: 1,
    },
    createdAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    createdBy: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    updatedBy: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE
    }
  }, {
    tableName: 'branches',
    timestamps: true,
    paranoid: true,
  });
  Branch.associate = function (models) {
    Branch.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    Branch.belongsTo(models.Province, {
      as: 'province',
      foreignKey: 'provinceId',
      targetKey: 'id',
    });

    Branch.belongsTo(models.District, {
      as: 'district',
      foreignKey: 'districtId',
      targetKey: 'id',
    });

    Branch.belongsTo(models.Ward, {
      as: 'ward',
      foreignKey: 'wardId',
      targetKey: 'id',
    });
  };
  return Branch;
};
