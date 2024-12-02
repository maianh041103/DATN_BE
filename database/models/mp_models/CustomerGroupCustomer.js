'use strict';
module.exports = (sequelize, DataTypes) => {
    const CustomerGroupCustomer = sequelize.define('CustomerGroupCustomer', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            primaryKey: true,
        },
        customerId: {
            allowNull: false,
            type: DataTypes.INTEGER(10).UNSIGNED,
        },
        groupCustomerId:{
            allowNull: false,
            type: DataTypes.INTEGER(10).UNSIGNED,
        }
    }, {
        tableName: 'customer_group_customers',
        timestamps: false,
        paranoid: false,
    });

    CustomerGroupCustomer.associate = function (models) {
        // associations can be defined here
        CustomerGroupCustomer.belongsTo(models.Customer, {
            as: 'customer',
            foreignKey: 'customerId',
            targetKey: 'id',
        });
        CustomerGroupCustomer.belongsTo(models.GroupCustomer, {
            as: 'groupCustomer',
            foreignKey: 'groupCustomerId',
            targetKey: 'id',
        });
    };

    return CustomerGroupCustomer;
};
