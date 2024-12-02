import {formatMobileToSave} from "../../helpers/utils";

const {hashPassword} = require("../auth/authService");
const {createUserTracking} = require("../behavior/behaviorService");
const _ = require("lodash");
const Sequelize = require("sequelize");
const {Op} = Sequelize;
const models = require("../../../database/models");
const sequelize = models.sequelize
const {checkUniqueValue, randomString} = require("../../helpers/utils");
const {customerStatus} = require("./customerConstant");
const {HttpStatusCode} = require("../../helpers/errorCodes");
const {addFilterByDate,formatExcelDate, checkCoordinates} = require("../../helpers/utils");
const {
    accountTypes,
    logActions,
    PAGE_LIMIT,
    userStatus,
} = require("../../helpers/choices");
const tripContant = require("../trip/tripContant");

const customerAttributes = [
    "id",
    "code",
    "phone",
    "email",
    "fullName",
    "address",
    "avatarId",
    "birthday",
    "facebook",
    "gender",
    "groupCustomerId",
    "position",
    "taxCode",
    "type",
    "status",
    "point",
    "debt",
    "storeId",
    "createdAt",
    "createdBy",
    "note",
    "isDefault",
    "lat",
    "lng",
    "customerStoreId",
    "companyName",
    [Sequelize.literal(`(SELECT COALESCE(SUM(debtAmount), 0) 
  FROM customer_debts 
  WHERE Customer.id = customer_debts.customerId and customer_debts.debtAmount >= 0)`), 'totalDebt'],
    [Sequelize.literal(`(SELECT COALESCE(SUM(totalPrice), 0) 
  FROM orders 
  WHERE Customer.id = orders.customerId and status = 'SUCCEED')`), 'totalOrderPay'],
    [Sequelize.literal(`(SELECT COUNT(id) FROM orders
    WHERE Customer.id = orders.customerId)`), 'totalOrder']
];

const customerIncludes = [
    {
        model: models.Image,
        as: "avatar",
        attributes: ["id", "originalName", "fileName", "filePath", "path"],
    },
    {
        model: models.CustomerGroupCustomer,
        as: "listGroupCustomer",
        attributes: ["id"],
        include:[{
            model:models.GroupCustomer,
            as:"groupCustomer",
            attributes: ["id", "name", "description", "type", "discount"],
        }]
    },
    {
        model: models.Province,
        as: "province",
        attributes: ["id", "name", "name2"],
    },
    {
        model: models.District,
        as: "district",
        attributes: ["id", "name", "name2"],
    },
    {
        model: models.Ward,
        as: "ward",
        attributes: ["id", "name", "name2"],
    },
    {
        model: models.User,
        as: "created_by",
        attributes: ["id", "username"],
    }
];

export async function customerFilter(params) {
    const {
        customerId,
        groupCustomerId,
        groupCustomerIds = [],
        keyword,
        phone,
        order = [],
    } = params;

    const conditions = {status: customerStatus.ACTIVE};

    if (phone) {
        conditions.phone = {
            [Op.like]: `%${phone.trim()}%`,
        };
    }
    if (customerId) {
        conditions.id = customerId;
    }
    if (groupCustomerId) {
        conditions.groupCustomerId = groupCustomerId;
    }
    if (type) {
        conditions.type = type;
    }
    if (_.isArray(groupCustomerIds) && groupCustomerIds.length) {
        conditions.groupCustomerId = groupCustomerIds;
    }
    if (keyword) {
        conditions[Op.or] = [
            {
                fullName: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            },
            {
                email: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            },
            {
                phone: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            },
        ];
    }
    const query = {
        attributes: customerAttributes,
        include: customerIncludes,
        where: conditions,
        raw: true,
    };
    if (_.isArray(order) && order.length) {
        query.order = order;
    }

    const rows = await models.Customer.findAll(query);
    for (const row of rows) {
        row.dataValues.totalOrder = parseInt(row.dataValues.totalOrder);
    }

    return rows;
}

export async function indexCustomers(filter) {
    const {
        page = 1,
        limit = 10,
        keyword = "",
        groupCustomerId,
        position = "",
        status = "",
        phone = "",
        listCustomer = [],
        storeId,
        isDefault,
        createdBy,
        createdAtRange = {},
        birthdayRange,
        totalDebtRange = {},
        totalOrderPayRange = {},
        pointRange = {},
        type,
        gender,
        createdAt
    } = filter;

    const conditions = {};
    if (keyword) {
        conditions[Op.or] = [
            {
                fullName: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            },
            {
                email: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            },
            {
                phone: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            },
            {
                code: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            },
            {
                companyName: {
                    [Op.like]: `%${keyword.trim()}%`
                }
            }
        ];
    }

    if (storeId) conditions.storeId = storeId;
    if (phone) conditions.phone = phone;
    if (groupCustomerId) conditions.groupCustomerId = groupCustomerId;
    if (position) conditions.position = position;
    if (status) conditions.status = status;
    if (_.isArray(listCustomer) && listCustomer.length) {
        conditions.id = listCustomer;
    }

    // if (createdBy) {
    //     conditions.createdBy = createdBy;
    // }
    //
    // // if (createdAtRange) {
    // //     let {
    // //         createdAtStart,
    // //         createdAtEnd
    // //     } = createdAtRange;
    // //     conditions.createdAt = addFilterByDate([createdAtStart, createdAtEnd]);
    // // }
    //
    // if (birthdayRange) {
    //     let {
    //         birthdayStart,
    //         birthdayEnd
    //     } = birthdayRange;
    //     conditions.birthday = addFilterByDate([birthdayStart, birthdayEnd]);
    // }

    if(createdAt){
        conditions.createdAt =  {
            [Op.between]: [
                new Date(`${createdAt} 00:00:00`),
                new Date(`${createdAt} 23:59:59`)
            ]
        }
    }

    if (pointRange) {
        let {
            pointStart = 0,
            pointEnd = 10 ** 9
        } = pointRange;

        conditions.point = {
            [Op.between]: [pointStart, pointEnd]
        }
    }

    if (type) {
        conditions.type = type;
    }

    if (gender) {
        conditions.gender = gender;
    }


    let {
        totalDebtStart = -(10 ** 99),
        totalDebtEnd = 10 ** 99
    } = totalDebtRange;
    let {
        totalOrderPayStart = -(10 ** 99),
        totalOrderPayEnd = 10 ** 99
    } = totalOrderPayRange;

    let query = {
        attributes: customerAttributes,
        include: customerIncludes,
        distinct: true,
        where: conditions,
        having: {
            totalDebt: {
                [Op.and]: {
                    [Op.lte]: totalDebtEnd,
                    [Op.gte]: totalDebtStart
                }
            },
            totalOrderPay: {
                [Op.and]: {
                    [Op.gte]: totalOrderPayStart,
                    [Op.lte]: totalOrderPayEnd
                }
            }
        },
        limit: +limit,
        offset: +limit * (+page - 1),
        order: [["isDefault", "DESC"], ["id", "DESC"]]
    };

    const [rows, count] = await Promise.all([
        models.Customer.findAll(query),
        models.Customer.count(query)
    ]);

    const point = await models.Point.findOne({
        where: {
            storeId: filter.storeId,
            status: "active"
        }
    });
    if (point)
        for (const row of rows) {
            row.dataValues.totalOrder = parseInt(row.dataValues.totalOrder);
            let check = 0;
            if (row.dataValues.totalOrder >= point.afterByTime) {
                if (point.isAllCustomer == true) {
                    check = 1;
                } else {
                    if (row.groupCustomerId != null) {
                        const isExists = await models.PointCustomer.findOne({
                            where: {
                                groupCustomerId: row.groupCustomerId
                            }
                        });
                        if (isExists) {
                            check = 1;
                        }
                    }
                }
            }
            if (check)
                row.dataValues.isPointPayment = true;
            else
                row.dataValues.isPointPayment = false;
        }

    return {
        success: true,
        data: {
            items: rows,
            totalItem: count || 0
        },
    };
}

export async function getTotalDebt(customerId) {
    const orders = await models.Order.findOne({
        attributes: []
    })
}

export async function readCustomer(id, loginUser) {
    if (!id) {
        console.log("Test")
        const defaultCust = await readDefaultCustomer(loginUser.storeId)
        return {
            success: true,
            data: defaultCust.data,
        };
    }

    const findCustomer = await models.Customer.findOne({
        attributes: customerAttributes,
        include: customerIncludes,
        where: {
            id
        },
    });
    if (!findCustomer) {
        throw new Error("Khách hàng không tồn tại");
    }
    findCustomer.dataValues.totalOrder = parseInt(findCustomer.dataValues.totalOrder);

    return {
        success: true,
        data: findCustomer,
    };
}

export async function readDefaultCustomer(storeId) {
    let findCustomer = await models.Customer.findOne({
        attributes: customerAttributes,
        include: customerIncludes,
        where: {
            storeId,
            isDefault: true
        },
    });
    if (!findCustomer) {
        await createDefaultCustomer(storeId)
        findCustomer = await models.Customer.findOne({
            attributes: customerAttributes,
            include: customerIncludes,
            where: {
                storeId,
                isDefault: true
            },
        });
    }

    findCustomer.dataValues.totalOrder = parseInt(findCustomer.dataValues.totalOrder);
    return {
        success: true,
        data: findCustomer,
    };
}

// update one customer
export async function updateCustomer(id, payload, loginUser) {
    const findCustomer = await models.Customer.findOne({
        attributes: customerAttributes,
        include: customerIncludes,
        where: {
            id,
            storeId: loginUser.storeId,
        },
    });
    if (!findCustomer) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Khách hàng không tồn tại",
        };
    }
    if(payload.phone && payload.phone !== "") {
        const phoneExists = await models.Customer.findOne({
            where: {
                id: {
                    [Op.ne]: id
                },
                phone: payload.phone,
                storeId:payload.storeId
            }
        });
        if (phoneExists) {
            throw new Error("Số điện thoại đã tồn tại");
        }
    }
    if(!checkCoordinates(payload.lng) || !checkCoordinates(payload.lat)) {
        return{
            error:true,
            code:HttpStatusCode.NOT_FOUND,
            message:"Địa chỉ nhập không hợp lệ"
        }
    }
    if (!findCustomer.code && !payload.code) {
        payload.code = `${generateCustomerCode(findCustomer.id)}`;
    }
    const t = await models.sequelize.transaction(async (t)=>{
        payload.groupCustomerId = payload.groupCustomerId ? payload.groupCustomerId : [];
        if(!Array.isArray(payload.groupCustomerId)){
            payload.groupCustomerId = [payload.groupCustomerId];
        }
        await models.CustomerGroupCustomer.destroy({
            where:{
                customerId:id,
                groupCustomerId:{
                    [Op.notIn]:payload.groupCustomerId
                }
            },
            transaction: t
        });
        for(const groupCustomerId of payload.groupCustomerId){
            const findGroupCustomerExists = await models.CustomerGroupCustomer.findOne({
                where:{
                    customerId:id,
                    groupCustomerId
                }
            });
            if(!findGroupCustomerExists){
                await models.CustomerGroupCustomer.create({
                    customerId:id,
                    groupCustomerId
                },{
                    transaction: t
                })
            }
        }
        delete payload.groupCustomerId;
        await models.Customer.update(payload, {
            where: {
                id,
            },
            transaction:t
        });

    })
    return {
        success: true,
    };
}

function generateCustomerCode(no) {
    if (no <= 0) return "KH000000";
    if (no < 10) return `KH00000${no}`;
    if (no < 100) return `KH0000${no}`;
    if (no < 1000) return `KH000${no}`;
    if (no < 10000) return `KH00${no}`;
    if (no < 100000) return `KH0${no}`;
    if (no < 1000000) return `KH${no}`;
    return no;
}

export async function createCustomer(payload, loginUser) {
    const checkPhone = await checkUniqueValue("Customer", {
        phone: payload.phone,
        storeId: loginUser.storeId,
    });

    if(!checkCoordinates(payload.lat)||!checkCoordinates(payload.lng)){
        return{
            error:true,
            code:HttpStatusCode.BAD_REQUEST,
            message: `Tọa độ nhập không hợp lệ`
        }
    }

    if (!checkPhone) {
        return {
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Số điện thoại ${payload.phone} đã được đăng ký`,
        };
    }
    let newCustomer;

    const t = await models.sequelize.transaction(async (t)=>{
        let groupCustomers = payload.groupCustomerId || [];
        if(!Array.isArray(groupCustomers)){
            groupCustomers = [groupCustomers];
        }
        delete payload.groupCustomerId;

        newCustomer = await models.Customer.create(payload,{
            transaction: t
        });

        groupCustomers = groupCustomers.map((item)=>{
            return{
                groupCustomerId:item,
                customerId:newCustomer.id
            }
        });
        await models.CustomerGroupCustomer.bulkCreate(groupCustomers,{
            transaction:t
        })

        if (!payload.code) {
            payload.code = `${generateCustomerCode(newCustomer.id)}`;
            await models.Customer.update(
                {code: payload.code},
                {where: {id: newCustomer.id},
                transaction: t}
            );
        }
    })

    createUserTracking({
        accountId: loginUser.id,
        type: accountTypes.USER,
        objectId: newCustomer.id,
        action: logActions.customer_create.value,
        data: payload,
    });

    return {
        success: true,
        data: await models.Customer.findByPk(newCustomer.id, {
            attributes: customerAttributes,
            include: customerIncludes,
        }),
    };
}

export async function createDefaultCustomer(storeId) {
    const payload = {
        storeId,
        fullName: "Khách lẻ",
        status: 'active',
        isDefault: true
    }
    const newCustomer = await models.Customer.create(payload);

    if (!payload.code) {
        payload.code = `${generateCustomerCode(newCustomer.id)}`;
        await models.Customer.update(
            {code: payload.code},
            {where: {id: newCustomer.id}}
        );
    }
}

export async function indexCustomersByGroup(filter) {
    const departments = await departmentFilter({
        ...filter,
        limit: PAGE_LIMIT,
    });

    const infoDepartment = {};
    for (let item of departments) {
        if (infoDepartment[item.id]) continue;
        infoDepartment[item.id] = {
            groupCustomerId: item.id,
            departmentName: item.name,
            listCustomer: [],
        };
    }

    const customers = await customerFilter(filter);

    for (let item of customers) {
        if (!infoDepartment[item.groupCustomerId]) continue;
        infoDepartment[item.groupCustomerId].listCustomer.push({
            id: item.id,
            fullName: item.fullName,
            phone: item.phone,
        });
    }

    return {
        success: true,
        data: {
            list_department: Object.values(infoDepartment),
        },
    };
}

export async function deleteCustomerById(id, loginUser) {
    const findCustomer = await models.Customer.findByPk(id, {
        attributes: ["id", "fullName", "phone"],
    });
    if (!findCustomer) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Khách hàng không tồn tại",
        };
    }
    const t = await models.sequelize.transaction(async (t)=>{
        await models.CustomerGroupCustomer.destroy({
            where:{
                customerId:id
            },
            transaction:t
        });
        await models.Customer.destroy({
            where: {
                id,
            },
            transaction:t
        });

    })
    createUserTracking({
        accountId: loginUser.id,
        type: accountTypes.USER,
        objectId: id,
        action: logActions.customer_delete.value,
        data: {
            id,
            fullName: findCustomer.fullName,
            phone: findCustomer.phone,
        },
    });

    return {
        success: true,
    };
}

// update password
export async function updatePassword(id, password, loginUser) {
    const findCustomer = await models.Customer.findByPk(id, {
        attributes: ["id"],
    });
    if (findCustomer) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Khách hàng không tồn tại",
        };
    }
    await models.Customer.update(
        {
            password: hashPassword(password),
            timeTokenInactive: new Date(),
        },
        {
            where: {
                id,
            },
        }
    );
    createUserTracking({
        accountId: loginUser.id,
        type: accountTypes.USER,
        objectId: id,
        action: logActions.customer_update_password.value,
        data: {id, password: "***"},
    });

    return {
        success: true,
    };
}

// update user status
export async function updateCustomerStatus(id, customer) {
    const findCustomer = await models.Customer.findByPk(id, {
        attributes: ["id", "status", "phone"],
    });

    if (!findCustomer) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Khách hàng không tồn tại",
        };
    }
    await models.Customer.update(customer, {
        where: {
            id,
        },
    });
    // if (customer.status == userStatus.ACTIVE) {
    //   // Thông báo tài khoản đã được kích hoạt
    //   sendNotificationThroughSms({
    //     phone: findCustomer.phone,
    //     content: `Tai khoan cua ban da duoc kich hoat. Ban hay dang nhap de nhan duoc gia uu dai tot hon nhe!`,
    //   });
    // }
    return {
        success: true,
    };
}

export async function getCustomer(customerId) {
    if (!customerId) return {};
    const customer = await customerFilter({customerId});
    if (customer.length) return customer[0];
    return {};
}

export async function indexPaymentCustomer(params, loginUser) {
    let {
        page,
        limit,
        customerId
    } = params
    const where = {};
    if (customerId) {
        where.customerId = customerId;
    }
    const payments = await models.Payment.findAll({
        offset: +limit * (+page - 1),
        limit: +limit,
        include: {
            model: models.User,
            as: "fullnameCreator",
            attributes: ["id", "fullName",],
        },
        order: [["id", "DESC"]],
        where
    });
    const count = await models.Payment.count({
        where
    });
    return {
        success: true,
        data: {
            items:payments,
            totalItem: count
        }
    }
}

const historyPointInclude = [
    {
        model: models.Order,
        as: "order",
        attributes: [
            "code",
            "totalPrice",
            "paymentPoint",
        ]
    },
    {
        model: models.Customer,
        as: "customer",
        attributes: ["fullName"]
    },
    {
        model: models.SaleReturn,
        as: "saleReturn",
        attributes: [
            "code",
            "totalPrice"
        ]
    }
]

export async function historyPointService(customerId, query) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    const {rows, count} = await models.PointHistory.findAndCountAll({
        attributes: [
            "point",
            "code",
            "note",
            [sequelize.literal(`(
        SELECT IFNULL(SUM(point), 0)
        FROM point_history AS sub
        WHERE sub.customerId = ${customerId} AND sub.id <= PointHistory.id AND sub.deletedAt IS NULL
      )`), 'postTransactionPoint']
        ],
        include: historyPointInclude,
        where: {
            customerId,
        },
        order: [['id', 'DESC']],
        limit,
        offset: (page - 1) * limit
    });

    for (const row of rows) {
        row.dataValues.postTransactionPoint = parseInt(row.dataValues.postTransactionPoint);
        if (row.order) {
            if (!row.code) {
                row.dataValues.code = row.order.code;
            }
            row.dataValues.totalPrice = row.order.totalPrice;
            row.dataValues.type = "Bán hàng";
        } else if (row.saleReturn) {
            if (!row.code) {
                row.dataValues.code = row.saleReturn.code;
            }
            row.dataValues.totalPrice = row.saleReturn.totalPrice;
            row.dataValues.type = "Trả hàng";
        } else {
            row.dataValues.type = "Cân bằng điểm";
        }
    }
    return {
        success: true,
        data: {
            items: rows,
            totalItem: count || 0
        },
    }
}

const tripCustomerInclude = [
    {
        model: models.Trip,
        as: "trip",
        include: [
            {
                model: models.User,
                as: "userManager",
                attributes: ["fullName"]
            }
        ]
    }
]

export async function historyVisitedService(customerId, query) {
    const limit = parseInt(query.limit) || 20;
    const page = parseInt(query.page) || 1;
    const where = {
        customerId,
        status: tripContant.TRIPSTATUS.VISITED
    }

    const {rows, count} = await models.TripCustomer.findAndCountAll({
        include: tripCustomerInclude,
        where,
        limit,
        offset: (page - 1) * limit,
        order: [["id", "DESC"]]
    })
    return {
        success: true,
        data: {
            items: rows,
            totalItem: count || 0
        },
    }
}

export async function uploadFileCreateCustomer(data, loginUser) {
    await models.sequelize.transaction(async (t) => {
        for (const item of data) {
            const customer = {
                fullName: _.get(item, 'Họ tên', '') ? _.get(item, 'Họ tên', '').toString().trim() : "",
                code: _.get(item, 'Mã khách hàng', '') ? _.get(item, 'Mã khách hàng', '').toString().trim() : "",
                birthday: _.get(item, 'Ngày sinh','') ? _.get(item, 'Ngày sinh','').toString().trim() : "",
                gender: _.get(item, 'Giới tính', 0) ? parseInt(_.get(item, 'Giới tính', 0).toString().trim()) : 0,
                phone: _.get(item, 'Số điện thoại', '') ? formatMobileToSave(_.get(item, 'Số điện thoại', '').toString().trim()) : "",
                email: _.get(item, 'Email', '') ? _.get(item, 'Email', '').toString().trim() : "",
                taxCode: _.get(item, 'Mã thuế', '') ? _.get(item, 'Mã thuế', '').toString().trim() : "",
                address: _.get(item, 'Địa chỉ', '') ? _.get(item, 'Địa chỉ', '').toString().trim() : "",
                facebook: _.get(item, 'Facebook', '') ? _.get(item, 'Facebook', '').toString().trim() : "",
                groupCustomerName: _.get(item, 'Nhóm khách hàng', '') ? _.get(item, 'Nhóm khách hàng', '').toString().trim() : "",
                status: parseInt(_.get(item, 'Trạng thái', 1).toString()),
                wardName: _.get(item, 'Xã', '') ? _.get(item, 'Xã', '').toString().trim() : "",
                districtName: _.get(item, 'Huyện', '') ? _.get(item, 'Huyện', '').toString().trim() : "",
                provinceName: _.get(item, 'Tỉnh', '') ? _.get(item, 'Tỉnh', '').toString().trim() : "",
                location: _.get(item,'Tọa độ','') ? _.get(item,'Tọa độ','').toString().trim() : "",
                type: parseInt(_.get(item, 'Loại khách hàng', 1).toString()),
                storeId: loginUser.storeId,
                createdBy: loginUser.id,
                createdAt: new Date(),
                note: _.get(item, 'Ghi chú', '') ? _.get(item, 'Ghi chú', '').toString().trim() : ""
            };

            if(!checkCoordinates(customer.lat) || !checkCoordinates(customer.lng)){
                throw new Error(`Tọa độ không hợp lệ`)
            }

            if (customer.gender == 1) {
                customer.gender = 'male';
            } else if (customer.gender == 0) {
                customer.gender = 'female';
            } else {
                customer.gender = 'other';
            }
            if(customer.birthday){
                customer.birthday = formatExcelDate(customer.birthday);
            }else{
                delete customer.birthday;
            }
            let groupCustomer = {}, ward, district, province;
            if (customer.status === 0) {
                customer.status = customerStatus.INACTIVE;
            } else if(customer.status === 2) {
                customer.status = customerStatus.DRAFT;
            }else{
                customer.status = customerStatus.ACTIVE;
            }
            province = await models.Province.findOne({
                where: {
                    name2: {
                        [Op.like]: `%${customer.provinceName}%`
                    }
                }, attributes: ["id"]
            });
            if (province) {
                district = await models.District.findOne({
                    where: {
                        name2: {
                            [Op.like]: `%${customer.districtName}%`
                        }, provinceId: province.id,
                    }, attributes: ["id"]
                });
                if (district) {
                    ward = await models.Ward.findOne({
                        where: {
                            name2: {
                                [Op.like]: `%${customer.wardName}%`
                            }, districtId: district.id,
                        }, attributes: ["id"]
                    });
                }
            }
            let lat = "",lng="";
            if(customer.location){
                [lat,lng] = customer.location.split(",");
            }
            const payload = {
                ...customer,
                wardId: ward ? ward.id : null,
                districtId: district ? district.id : null,
                provinceId: province ? province.id : null,
                lat: lat ? lat.trim() : "",
                lng: lng ? lng.trim() : ""
            }

            if(payload.phone) {
                const checkPhone = await models.Customer.findOne({
                    where: {
                        phone: customer.phone,
                        storeId: loginUser.storeId,
                    }
                });
                if (checkPhone) {
                    throw new Error(`Số điện thoại ${payload.phone} đã được đăng ký`);
                }
            }

            const newCustomer = await models.Customer.create(payload, {
                transaction: t
            });

            if (!payload.code) {
                payload.code = `${generateCustomerCode(newCustomer.id)}`;
                await models.Customer.update(
                    {code: payload.code},
                    {
                        where: {id: newCustomer.id},
                        transaction: t
                    }
                );
            }

            let listCustomerName = customer.groupCustomerName.split("|");
            if (listCustomerName.length > 0) {
                for(const groupCustomerName of listCustomerName){
                    [groupCustomer] = await models.GroupCustomer.findOrCreate({
                        where: {
                            name: {
                                [Op.like]: `%${groupCustomerName}%`
                            },
                            storeId: customer.storeId
                        },
                        defaults: {
                            name: groupCustomerName,
                            storeId: customer.storeId,
                            createdBy: loginUser.id
                        },
                        transaction: t
                    });

                    await models.CustomerGroupCustomer.create({
                        customerId: newCustomer.id,
                        groupCustomerId: groupCustomer.id
                    },{
                        transaction:t
                    })
                }
            }

            createUserTracking({
                accountId: loginUser.id,
                type: accountTypes.USER,
                objectId: newCustomer.id,
                action: logActions.customer_create.value,
                data: payload,
            });
        }
    });
    return{
        success:true,
        data:null
    }
}

export async function uploadFileCreateCustomerKiotVietService(data, loginUser) {
    try {
        await models.sequelize.transaction(async (t) => {
            for (const item of data) {
                const customer = {
                    fullName: _.get(item, 'Tên khách hàng', '') ? _.get(item, 'Tên khách hàng', '').toString().trim() : "",
                    code: _.get(item, 'Mã khách hàng', '') ? _.get(item, 'Mã khách hàng', '').toString().trim() : "",
                    birthday: _.get(item, 'Ngày sinh','') ? _.get(item, 'Ngày sinh','').toString().trim() : "",
                    gender: _.get(item, 'Giới tính', 'Nam') ? _.get(item, 'Giới tính', 'Nam').toString().trim() : "",
                    phone: _.get(item, 'Điện thoại', '') ? formatMobileToSave(_.get(item, 'Điện thoại', '').toString().trim()) : "",
                    email: _.get(item, 'Email', '') ? _.get(item, 'Email', '').toString().trim() : "",
                    taxCode: _.get(item, 'Mã số thuế', '') ? _.get(item, 'Mã số thuế', '').toString().trim() : "",
                    address: _.get(item, 'Địa chỉ', '') ? _.get(item, 'Địa chỉ', '').toString().trim() : "",
                    groupCustomerName: _.get(item, 'Nhóm khách hàng', '') ? _.get(item, 'Nhóm khách hàng', '').toString().trim() : "",
                    status: _.get(item, 'Trạng thái', 1) ? parseInt(_.get(item, 'Trạng thái', 1).toString().trim()) : 1,
                    wardName: _.get(item, 'Phường/Xã', '') ? _.get(item, 'Phường/Xã', '').toString().trim() : "",
                    districtAndProvinceName: _.get(item, 'Khu vực giao hàng', '') ? _.get(item, 'Khu vực giao hàng', '').toString().trim() : "",
                    type: _.get(item, 'Loại khách', 'Cá nhân') ? _.get(item, 'Loại khách', 'Cá nhân').toString().trim() : "",
                    company: _.get(item,'Công ty','') ? _.get(item,'Công ty','').toString().trim() : "",
                    point:_.get(item, 'Điểm hiện tại', 0) ? parseInt(_.get(item, 'Điểm hiện tại', 0).toString().trim()) : 0,
                    debt:_.get(item, 'Nợ cần thu hiện tại', 0) ? parseInt(_.get(item, 'Nợ cần thu hiện tại', 0).toString().trim()) : 0,
                    facebook: _.get(item,'Facebook','') ? _.get(item,'Facebook','').toString().trim() : "",
                    storeId: loginUser.storeId,
                    createdBy: loginUser.id,
                    createdAt: new Date(),
                    note: _.get(item, 'Ghi chú', '') ? _.get(item, 'Ghi chú', '').toString().trim() : "",
                    location: _.get(item,'Tọa độ','') ? _.get(item,'Tọa độ','').toString().trim() : ""
                };

                if (customer.gender === 'Nam') {
                    customer.gender = 'male';
                }
                else {
                    customer.gender = 'female';
                }
                if(customer.type === 'Cá nhân'){
                    customer.type = 1;
                }else{
                    customer.type = 2;
                }
                if(customer.birthday){
                    customer.birthday = formatExcelDate(customer.birthday);
                }else{
                    delete customer.birthday;
                }
                let groupCustomer = {}, ward, district, province;
                if (customer.status === 0) {
                    customer.status = customerStatus.INACTIVE;
                } else if(customer.status === 2) {
                    customer.status = customerStatus.DRAFT;
                }else{
                    customer.status = customerStatus.ACTIVE;
                }
                let [provinceName = "",districtName = ""] = customer.districtAndProvinceName.split("-");
                if(provinceName) {
                    province = await models.Province.findOne({
                        where: {
                            [Op.or]: {
                                name2: {
                                    [Op.like]: `${provinceName.trim()}`
                                },
                                name: {
                                    [Op.like]: `${provinceName.trim()}`
                                }
                            }
                        }, attributes: ["id"]
                    });
                }
                if (province && districtName) {
                    district = await models.District.findOne({
                        where: {
                            [Op.or]:{
                                name2: {
                                    [Op.like]: `${districtName.trim()}`
                                },
                                name:{
                                    [Op.like]: `${provinceName.trim()}`
                                }
                            }, provinceId: province.id,
                        }, attributes: ["id"]
                    });
                    if (district && customer.wardName) {
                        ward = await models.Ward.findOne({
                            where: {
                                [Op.or]:{
                                    name2: {
                                        [Op.like]: `${customer.wardName.trim()}`
                                    },
                                    name:{
                                        [Op.like]: `${customer.wardName.trim()}`
                                    }
                                }, districtId: district.id,
                            }, attributes: ["id"]
                        });
                    }
                }
                let lng = "",lat = "";
                if(customer.location){
                    [lat,lng] = customer.location.split(",");
                }
                const payload = {
                    ...customer,
                    wardId: ward? ward.id:null,
                    districtId: district? district.id:null,
                    provinceId: province? province.id : null,
                    lng: lng ? lng.trim() : "",
                    lat: lat ? lat.trim() : ""
                }

                if(customer.phone) {
                    const checkPhone = await models.Customer.findOne({
                        where: {
                            phone: customer.phone,
                            storeId: loginUser.storeId,
                        }
                    });
                    if (checkPhone) {
                        throw new Error(`Số điện thoại ${payload.phone} đã được đăng ký`);
                    }
                }

                const newCustomer = await models.Customer.create(payload, {
                    transaction: t
                });
                if (!payload.code) {
                    payload.code = `${generateCustomerCode(newCustomer.id)}`;
                    await models.Customer.update(
                        {code: payload.code},
                        {
                            where: {id: newCustomer.id},
                            transaction: t
                        }
                    );
                }

                let listCustomerName = customer.groupCustomerName.split("|");
                if (listCustomerName.length > 0) {
                    for(const groupCustomerName of listCustomerName){
                        [groupCustomer] = await models.GroupCustomer.findOrCreate({
                            where: {
                                name: {
                                    [Op.like]: `%${groupCustomerName}%`
                                },
                                storeId: customer.storeId
                            },
                            defaults: {
                                name: groupCustomerName,
                                storeId: customer.storeId,
                                createdBy: loginUser.id
                            },
                            transaction: t
                        });

                        await models.CustomerGroupCustomer.create({
                            customerId: newCustomer.id,
                            groupCustomerId: groupCustomer.id
                        },{
                            transaction:t
                        })
                    }
                }

                createUserTracking({
                    accountId: loginUser.id,
                    type: accountTypes.USER,
                    objectId: newCustomer.id,
                    action: logActions.customer_create.value,
                    data: payload,
                });
            }
        });
        return{
            success:true,
            data:null
        }
    }catch(e){
        return{
            error:true,
            code:HttpStatusCode.BAD_REQUEST,
            message:`${e}`
        }
    }
}

export async function deleteListCustomer(loginUser,listCustomerId) {
    const listCustomer = await models.Customer.findAll({
        where:{
            id:{
                [Op.in]:listCustomerId
            },
            storeId:loginUser.storeId
        }
    })
    if (!listCustomer || listCustomer.length !== listCustomerId.length) {
        return {
            error: true,
            code: HttpStatusCode.NOT_FOUND,
            message: "Tồn tại khách hàng không thuộc cửa hàng",
        };
    }
    const t = await models.sequelize.transaction(async (t)=>{
        await models.CustomerGroupCustomer.destroy({
            where:{
                customerId:{
                    [Op.in]:listCustomerId
                }
            },
            transaction:t
        });
        await models.Customer.destroy({
            where: {
                id:{
                    [Op.in]:listCustomerId
                }
            },
            transaction:t
        });
    });

    for(const customer of listCustomer){
        createUserTracking({
            accountId: loginUser.id,
            type: accountTypes.USER,
            objectId: customer.id,
            action: logActions.customer_delete.value,
            data: {
                id:customer.id,
                fullName: customer.fullName,
                phone: customer.phone,
            },
        });
    }

    return {
        success: true,
    };
}