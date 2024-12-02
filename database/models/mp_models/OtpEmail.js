'use strict';
module.exports = (sequelize, DataTypes) => {
  const OtpEmail = sequelize.define('OtpEmail', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    otp: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValues: 'active'
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    tableName: 'otpEmail',
    timestamps: true
  });

  OtpEmail.associate = function (models) {
    // associations can be defined here
  };

  return OtpEmail;
};
