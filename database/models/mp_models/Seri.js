'use strict';
module.exports = (sequelize, Sequelize) => {
    const Seri = sequelize.define('Seri', {
        id: {
            type: Sequelize.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        code: {
            allowNull: false,
            type: Sequelize.STRING
        },
        marketOrderId:{
            allowNull: false,
            type:Sequelize.INTEGER(10).UNSIGNED
        },
        marketProductId:{
            allowNull: false,
            type:Sequelize.INTEGER(10).UNSIGNED
        },
        storeId:{
            allowNull:false,
            type:Sequelize.INTEGER(10).UNSIGNED
        },
        createdBy:{
            allowNull: true,
            type:Sequelize.INTEGER(10).UNSIGNED,
        }
    }, {
        tableName: 'seri',
        timestamps: false,
        paranoid: false,
    });
    Seri.associate = function (models) {
        Seri.belongsTo(models.MarketOrder, {
            as: 'marketOrder',
            foreignKey: 'marketOrderId',
            targetKey: 'id',
        });
        Seri.belongsTo(models.MarketProduct, {
            as: 'marketProduct',
            foreignKey: 'marketProductId',
            targetKey: 'id',
        });
        Seri.belongsTo(models.User, {
            as: 'userCreated',
            foreignKey: 'createdBy',
            targetKey: 'id',
        });
        Seri.belongsTo(models.Store,{
            as: 'store',
            foreignKey: 'storeId',
            targetKey: 'id',
        })
    };
    return Seri;
};
