'use strict';
module.exports = (sequelize, DataTypes) => {
    const GroupAgency = sequelize.define('GroupAgency', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        storeId: {
            allowNull: false,
            type: DataTypes.INTEGER(10).UNSIGNED,
        },
        name: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        description:{
            allowNull:true,
            type: DataTypes.STRING
        },
        createdBy: {
            allowNull: true,
            type: DataTypes.INTEGER(10).UNSIGNED
        },
        updatedBy: {
            allowNull: true,
            type: DataTypes.INTEGER(10).UNSIGNED
        }
    }, {
        tableName: 'group_agency',
        timestamps: true,
        paranoid: true,
    });
    GroupAgency.associate = function (models) {
        // associations can be defined here
        GroupAgency.belongsTo(models.Store, {
            as: 'store',
            foreignKey: 'storeId',
            sourceKey: 'id'
        });
        GroupAgency.belongsTo(models.User,{
            as:"userCreated",
            foreignKey: 'createdBy',
            sourceKey: 'id'
        });
        GroupAgency.belongsTo(models.User,{
            as:"userUpdated",
            foreignKey: 'updatedBy',
            sourceKey: 'id'
        })
    };
    return GroupAgency;
};
