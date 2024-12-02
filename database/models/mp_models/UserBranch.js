'use strict';
module.exports = (sequelize, DataTypes) => {
    const UserBranch = sequelize.define('UserBranch', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        branchId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    }, {
        tableName: 'user_branches',
        timestamps: false,
    });
    UserBranch.associate = function (models) {
        UserBranch.belongsTo(models.Branch, {
            as: "branch",
            foreignKey: "branchId",
            targetKey: "id",
        });
        UserBranch.belongsTo(models.User, {
            as: "user",
            foreignKey: 'userId',
            targetKey: "id",
        })
    };
    return UserBranch;
};
