'use strict';
module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define('Supplier', {
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
    // Mã NCC
    code: {
      allowNull: true,
      type: Sequelize.STRING
    },
    // Mã số thuế
    taxCode: {
      allowNull: true,
      type: Sequelize.STRING
    },
    phone: {
      allowNull: false,
      type: Sequelize.STRING
    },
    email: {
      allowNull: false,
      type: Sequelize.STRING
    },
    companyName: {
      allowNull: true,
      type: Sequelize.STRING
    },
    groupSupplierId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    storeId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    branchId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    address: {
      allowNull: true,
      type: Sequelize.STRING
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
    note: {
      allowNull: true,
      type: Sequelize.STRING
    },
    status: {
      allowNull: false,
      type: Sequelize.INTEGER(1).UNSIGNED,
      defaultValue: 1,
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
    tableName: 'suppliers',
    timestamps: true,
    paranoid: true,
  });
  Supplier.associate = function (models) {
    Supplier.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    Supplier.belongsTo(models.Branch, {
      as: 'branch',
      foreignKey: 'branchId',
      targetKey: 'id',
    });

    Supplier.belongsTo(models.GroupSupplier, {
      as: 'groupSupplier',
      foreignKey: 'groupSupplierId',
      targetKey: 'id',
    });

    Supplier.belongsTo(models.Province, {
      as: 'province',
      foreignKey: 'provinceId',
      targetKey: 'id',
    });

    Supplier.belongsTo(models.District, {
      as: 'district',
      foreignKey: 'districtId',
      targetKey: 'id',
    });

    Supplier.belongsTo(models.Ward, {
      as: 'ward',
      foreignKey: 'wardId',
      targetKey: 'id',
    });

    Supplier.belongsTo(models.User, {
      as: "created_by",
      foreignKey: "createdBy",
      targetKey: "id"
    });
  };
  return Supplier;
};
