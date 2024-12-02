'use strict';
module.exports = (sequelize, Sequelize) => {
  return sequelize.define('Codes', {
        id: {
          type: Sequelize.INTEGER(11).UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        storeId: {
          allowNull: true,
          type: Sequelize.INTEGER(11).UNSIGNED,
        },
        value: {
          allowNull: true,
          type: Sequelize.INTEGER(11).UNSIGNED,
          default: 0
        },
        // 1 - Thuốc, 2 - Hàng hóa, 3 - Combo, đóng gói, 4 - Đơn thuốc mẫu
        type: {
          allowNull: false,
          type: Sequelize.INTEGER(1).UNSIGNED,
        },
      },{
          tableName: 'codes',
          timestamps: false
      }
  );
};
