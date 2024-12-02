'use strict';
module.exports = (sequelize, Sequelize) => {
  const Store = sequelize.define('Store', {
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
    email: {
      allowNull: true,
      type: Sequelize.STRING
    },
    field: {
      allowNull: true,
      type: Sequelize.STRING
    },
    address: {
      allowNull: true,
      type: Sequelize.STRING
    },
    logoId: {
      allowNull: true,
      type: Sequelize.INTEGER(10).UNSIGNED,
    },
    wardId: {
      allowNull: true,
      type: Sequelize.INTEGER(10).UNSIGNED,
    },
    districtId: {
      allowNull: true,
      type: Sequelize.INTEGER(5).UNSIGNED,
    },
    provinceId: {
      allowNull: true,
      type: Sequelize.INTEGER(2).UNSIGNED,
    },
    loginAddress: {
      allowNull: true,
      type: Sequelize.STRING
    },
    // Giấy phép đăng ký kinh doanh
    businessRegistrationImageId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    // Số đăng ký kinh doanh
    businessRegistrationNumber: {
      allowNull: true,
      type: Sequelize.STRING
    },
    expiredDate: {
      allowNull: true,
      type: Sequelize.DATE
    },
    status: {
      allowNull: false,
      type: Sequelize.INTEGER(1).UNSIGNED,
      defaultValue: 1,
    },
    isAgency:{
      allowNull:true,
      type:Sequelize.BOOLEAN,
      defaultValue:false
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
    tableName: 'stores',
    timestamps: true,
    paranoid: true,
  });

  Store.associate = function (models) {
    Store.belongsTo(models.Province, {
      as: 'province',
      foreignKey: 'provinceId',
      targetKey: 'id',
    });

    Store.belongsTo(models.District, {
      as: 'district',
      foreignKey: 'districtId',
      targetKey: 'id',
    });

    Store.belongsTo(models.Ward, {
      as: 'ward',
      foreignKey: 'wardId',
      targetKey: 'id',
    });

    Store.belongsTo(models.Image, {
      as: 'businessRegistrationImage',
      foreignKey: 'businessRegistrationImageId',
      targetKey: 'id',
    });

    Store.belongsTo(models.Image, {
      as: 'logo',
      foreignKey: 'logoId',
      targetKey: 'id',
    });

    Store.hasMany(models.MarketProduct,{
      as:"marketProduct",
      foreignKey:"storeId",
      sourceKey:"id"
    });

    Store.hasMany(models.User, {
      as: 'users',
      foreignKey: 'storeId',
      targetKey: 'id'
    });

    Store.hasMany(models.Branch,{
      as:"branches",
      foreignKey: "storeId",
      targetKey: 'id'
    });

    Store.hasMany(models.RequestAgency,{
      as:"agencys",
      foreignKey:"storeId",
      sourceKey:"id"
    })
  };
  return Store;
};
