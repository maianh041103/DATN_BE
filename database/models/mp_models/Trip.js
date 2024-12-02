'use strict';
const Sequelize = require("sequelize");
const tripContant = require("../../../src/mpModules/trip/tripContant");
module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lat: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lng: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    latEnd: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lngEnd: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    latCurrent: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lngCurrent: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: null
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    userId: { //Người phụ trách
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    note: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    storeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    currentAddress: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(tripContant.TRIPSTATUS.DONE,
        tripContant.TRIPSTATUS.PENDING
      ),
      allowNull: true,
      defaultValue: tripContant.TRIPSTATUS.PENDING
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
    }
  }, {
    tableName: 'trips',
    timestamps: true,
    paranoid: true
  });
  Trip.associate = function (models) {
    Trip.hasMany(models.TripCustomer, {
      as: "tripCustomer",
      foreignKey: 'tripId',
      sourceKey: "id",
    });
    Trip.belongsTo(models.User, {
      as: "userCreated",
      foreignKey: "createdBy",
      targetKey: "id",
    });
    Trip.belongsTo(models.User, {
      as: "userManager",
      foreignKey: 'userId',
      targetKey: "id",
    });
    Trip.belongsTo(models.TripCustomer, {
      as: "customerCurrent",
      foreignKey: "currentAddress",
      sourceKey: "id"
    })
  };
  return Trip;
};
