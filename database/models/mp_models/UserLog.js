'use strict';
const userLogContant = require("../../../src/mpModules/userLog/userLogContant");
module.exports = (sequelize, Sequelize) => {
    const UserLog = sequelize.define('UserLog', {
        id: {
            type: Sequelize.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        userId: {
            allowNull: false,
            type: Sequelize.INTEGER(11)
        },
        code: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        type: {
            type: Sequelize.ENUM(
                userLogContant.TYPE.ORDER,
                userLogContant.TYPE.SALE_RETURN,
                userLogContant.TYPE.INBOUND,
                userLogContant.TYPE.PURCHASE_RETURN,
                userLogContant.TYPE.INVENTORY_CHECKING,
                userLogContant.TYPE.MOVE,
                userLogContant.TYPE.RECEIVE
            ),
            allowNull: false
        },
        amount: {
            type: Sequelize.BIGINT,
            allowNull: true
        },
        branchId: {
            allowNull: false,
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
        tableName: 'user_logs',
        timestamps: true,
        paranoid: true,
    });
    UserLog.associate = function (models) {
        UserLog.belongsTo(models.Branch, {
            as: 'branch',
            foreignKey: 'branchId',
            targetKey: 'id',
        });
        UserLog.belongsTo(models.User, {
            as: 'createdBy',
            foreignKey: 'userId',
            targetKey: 'id',
        });
    };
    return UserLog;
};