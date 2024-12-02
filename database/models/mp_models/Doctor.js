'use strict';
module.exports = (sequelize, Sequelize) => {
  const Doctor = sequelize.define('Doctor', {
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
      allowNull: true,
      type: Sequelize.STRING
    }, 
    // Mã bác sĩ
    code: {
      allowNull: true,
      type: Sequelize.STRING
    },
    email: {
      allowNull: true,
      type: Sequelize.STRING
    },
    gender: {
      type: Sequelize.ENUM("male", "female", "other"),
      defaultValue: "other",
    },
    avatarId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    specialistId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    levelId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
    },
    workPlaceId: {
      allowNull: true,
      type: Sequelize.INTEGER(11).UNSIGNED,
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
    address: {
      allowNull: true,
      type: Sequelize.STRING
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
    tableName: 'doctors',
    timestamps: true,
    paranoid: true,
  });
  Doctor.associate = function (models) {
    Doctor.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      targetKey: 'id',
    });

    Doctor.belongsTo(models.Specialist, {
      as: 'specialist',
      foreignKey: 'specialistId',
      targetKey: 'id',
    });

    Doctor.belongsTo(models.Level, {
      as: 'level',
      foreignKey: 'levelId',
      targetKey: 'id',
    });

    Doctor.belongsTo(models.WorkPlace, {
      as: 'workPlace',
      foreignKey: 'workPlaceId',
      targetKey: 'id',
    });

    Doctor.belongsTo(models.Image, {
      as: "avatar",
      foreignKey: "avatarId",
      targetKey: "id",
    });

    Doctor.belongsTo(models.Province, {
      as: 'province',
      foreignKey: 'provinceId',
      targetKey: 'id',
    });

    Doctor.belongsTo(models.District, {
      as: 'district',
      foreignKey: 'districtId',
      targetKey: 'id',
    });

    Doctor.belongsTo(models.Ward, {
      as: 'ward',
      foreignKey: 'wardId',
      targetKey: 'id',
    });
  };
  return Doctor;
};
