'use strict';
module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    otp: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    status: {
      allowNull: true,
      type: DataTypes.INTEGER(1).UNSIGNED,
      defaultValues: 0
    },
    count: {
      allowNull: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
      defaultValues: 1
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    tableName: 'otps',
    timestamps: false
  });

  Otp.associate = function (models) {
    // associations can be defined here
  };

  return Otp;
};
