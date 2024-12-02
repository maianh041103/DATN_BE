'use strict';
const marketConfigContant = require("../../../src/mpModules/marketConfig/marketConfigContant");
module.exports = (sequelize, DataTypes) => {
    const RequestAgency = sequelize.define('RequestAgency', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        storeId:{
            allowNull: false,
            type: DataTypes.INTEGER(10).UNSIGNED,
        },
        agencyId: {
            allowNull: false,
            type: DataTypes.INTEGER(10).UNSIGNED
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM(marketConfigContant.AGENCY_STATUS.ACTIVE,
                marketConfigContant.AGENCY_STATUS.CANCEL,
                marketConfigContant.AGENCY_STATUS.PENDING
            ),
            defaultValues: marketConfigContant.AGENCY_STATUS.PENDING
        },
        groupAgencyId: {
            allowNull: true,
            type: DataTypes.INTEGER(10).UNSIGNED
        }
    }, {
        tableName: 'request_agency',
        timestamps: true,
        paranoid: true,
    });
    RequestAgency.associate = function (models) {
        // associations can be defined here
        RequestAgency.belongsTo(models.Store, {
            as: 'store',
            foreignKey: 'storeId',
            targetKey: 'id',
        });
        RequestAgency.belongsTo(models.Store, {
            as: "agency",
            foreignKey: "agencyId",
            targetKey: "id"
        })
        RequestAgency.belongsTo(models.GroupAgency, {
            as: "groupAgency",
            foreignKey: "groupAgencyId",
            targetKey: "id"
        });
        RequestAgency.hasMany(models.MarketProductAgency,{
            as:"productAgencys",
            foreignKey: "agencyId",
            sourceKey: "id"
        })
    };
    return RequestAgency;
};
