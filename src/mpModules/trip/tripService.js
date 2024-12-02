const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const axios = require('axios');
const tripContant = require("./tripContant");
const { generateCode } = require("../../helpers/codeGenerator");
const { client } = require("../../../redis/redisConnect");
const config = require("../../../config/default.json");
const {checkDouble, checkCoordinates} = require("../../helpers/utils");

const tripAttributes = [
    "id",
    "code",
    "name",
    "lat",
    "lng",
    "latEnd",
    "lngEnd",
    "latCurrent",
    "lngCurrent",
    "time",
    "createdBy",
    "userId",
    "note",
    "status",
    "currentAddress",
    [Sequelize.literal(`(SELECT COUNT(trip_customer.id) FROM trip_customer WHERE tripId = Trip.id
        AND status = '${tripContant.TRIPSTATUS.VISITED} AND trip_customer.deletedAt IS NULL')`), 'countVisited'],
    [Sequelize.literal(`(SELECT COUNT(trip_customer.id) FROM trip_customer WHERE tripId = Trip.id
        AND status <> '${tripContant.TRIPSTATUS.SKIP}' AND trip_customer.deletedAt IS NULL)`), 'total'],
    "createdAt",
];

let tripIncludes = [
    {
        model: models.User,
        as: "userCreated",
        attributes: ["id", "fullName"]
    },
    {
        model: models.User,
        as: "userManager",
        attributes: ["id", "fullName"]
    },
    {
        model: models.TripCustomer,
        as: "tripCustomer",
        attributes: ["id", "customerId", "lat", "lng", "status", "stt", "address"],
        where: {
            status: {
                [Op.ne]: tripContant.TRIPSTATUS.SKIP
            }
        },
        include: [{
            model: models.Customer,
            as: "customer",
            attributes: ["id", "code", "fullName", "phone", "status"]
        }]
    }
]

const sortMap = async (listPoint) => {
    let points = listPoint.join("&point=");
    let API_KEY = tripContant.KEY.API_KEY;
    points = "point=" + points;
    const apiUrl = `https://maps.vietmap.vn/api/matrix?api-version=1.1&apikey=${API_KEY}&${points}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    let res = travel(data);
    res.shift();
    res.shift();
    console.log(res);
    return res;
}

const travel = (data) => {
    let X = []; //X[i] là số thứ tự thành phố thứ i đi qua
    let d = 0; //Tính khoảng cách đi lại
    let ans = 999999999; //lưu chi phí đường đi tối ưu
    let cmin = 999999999; //lưu chi phí 1 quãng đường ngắn nhất
    X[1] = 1;
    let c = data.distances; //Mảng giá trị
    c.unshift([0]);
    for (let i = 0; i < c.length; i++) {
        c[i].unshift(0);
    }
    for (const row of c) {
        for (const col of row) {
            if (col != 0) {
                cmin = Math.min(cmin, col);
            }
        }
    }
    let n = c.length; //n thành phố
    let visited = Array(n).fill(0); //mảng đánh dấu
    n -= 2;
    visited[1] = 1;
    let X_best = []; //Lưu kết quả đi tốt nhất

    const Try = (i) => {
        for (let j = 2; j <= n; j++) {
            if (visited[j] == 0) {
                visited[j] = 1;
                X[i] = j;
                d += c[X[i - 1]][X[i]];
                if (i == n) {
                    console.log("d + cuoi " + (d + c[X[i]][n + 1]))
                    if (ans > d + c[X[i]][n + 1]) {
                        ans = d + c[X[i]][n + 1];
                        console.log("CAP NHAT ANS " + ans);
                        X_best = [...X];
                        console.log(("CAP NHAT X_BEST " + X_best));
                    }
                }
                else if (d + (n - i + 1) * cmin < ans) {
                    Try(i + 1);
                }
                //backtrack
                visited[j] = 0;
                d -= c[X[i - 1]][X[i]];
            }
        }
    }
    Try(2);
    return X_best;
}

module.exports.createTrip = async (params) => {
    const { name, lat, lng, time, latEnd, lngEnd, userId, note, listCustomer, createdBy, storeId, status = tripContant.TRIPSTATUS.PENDING } = params;
    const userExists = await models.User.findOne({
        where: {
            storeId: storeId,
            id: userId
        }
    });

    if (!userExists) {
        return {
            error: true,
            message: "Không tìm thấy nhân viên phụ trách",
            code: HttpStatusCode.BAD_REQUEST
        }
    }
    let newTrip;
    //Trong transaction sử dụng return chỉ thoát ra khỏi hàm hiện tại trong transaction
    const t = await models.sequelize.transaction(async (t) => {
        newTrip = await models.Trip.create({
            name, lat, lng, latEnd, lngEnd, time, createdBy, userId, note, storeId, status,
            latCurrent: lat,
            lngCurrent: lng
        }, {
            transaction: t
        });
        const code = generateCode("TOUR", newTrip.id);
        await models.Trip.update({
            code
        }, {
            where: {
                id: newTrip.id
            },
            transaction: t
        })
        newTrip.code = code;
        let listPoint = [];
        listPoint.push(`${lat},${lng}`);
        for (const item of listCustomer) {
            if (!item.lat || !item.lng) {
                const customer = await models.Customer.findOne({
                    where: {
                        id: item.id,
                        lat: {
                            [Op.ne]: null
                        },
                        lng: {
                            [Op.ne]: null
                        },
                        storeId: storeId
                    }
                });
                if (!customer) {
                    throw new Error("Không tồn tại khách hàng hoặc địa chỉ không hợp lệ");
                }
                listPoint.push(`${customer.lat},${customer.lng}`);
            } else {
                listPoint.push(`${item.lat},${item.lng}`);
            }
        }
        if (listCustomer.length > 1) {
            listPoint.push(`${latEnd},${lngEnd}`);
            let res = await sortMap(listPoint);
            for (let i = 0; i < listCustomer.length; i++) {
                let lngTmp, latTmp;
                if (!listCustomer[i].lng || !listCustomer[i].lat) {
                    const customer = await models.Customer.findOne({
                        where: {
                            id: listCustomer[i].id
                        }
                    });
                    lngTmp = customer.lng;
                    latTmp = customer.lat;
                } else {
                    lngTmp = listCustomer[i].lng;
                    latTmp = listCustomer[i].lat;
                }
                const index = res.findIndex(item => item == i + 2);
                const address = await reverse(lngTmp, latTmp);

                await models.TripCustomer.create({
                    tripId: newTrip.id,
                    customerId: listCustomer[i].id,
                    lat: latTmp,
                    lng: lngTmp,
                    status: tripContant.TRIPSTATUS.NOT_VISITED,
                    stt: index + 1,
                    address
                }, {
                    transaction: t
                });
            }
        } else {
            let lng, lat;
            if (!listCustomer[0].lng || !listCustomer[0].lat) {
                const customer = await models.Customer.findOne({
                    where: {
                        id: listCustomer[0].id
                    }
                });
                lng = customer.lng;
                lat = customer.lat;
            } else {
                lng = listCustomer[0].lng;
                lat = listCustomer[0].lat;
            }
            const address = await reverse(lng, lat);
            await models.TripCustomer.create({
                tripId: newTrip.id,
                customerId: listCustomer[0].id,
                lat: lat,
                lng: lng,
                status: tripContant.TRIPSTATUS.NOT_VISITED,
                stt: 1,
                address
            }, {
                transaction: t
            });
        }
    })

    return {
        success: true,
        data: {
            trip: newTrip
        },
    }
}

const reverse = async (lng, lat) => {
    let API_KEY = tripContant.KEY.API_KEY;
    const apiUrl = `https://maps.vietmap.vn/api/reverse/v3?apikey=${API_KEY}&lng=${lng}&lat=${lat}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    return data[0].display;
}

module.exports.getListTrip = async (params) => {
    const { storeId, page = 1, limit = 20, keyword, status } = params;
    let where = {};
    if (keyword) {
        where = {
            [Op.or]: {
                name: {
                    [Op.like]: `%${keyword}%`
                },
                code: {
                    [Op.like]: `%${keyword}%`
                }
            }
        }
    }
    where.storeId = storeId;
    if (status) {
        where.status = status;
    }

    const rows = await models.Trip.findAll({
        attributes: tripAttributes,
        include: tripIncludes,
        where,
        order: [
            ['createdAt', 'DESC'],
            [{ model: models.TripCustomer, as: "tripCustomer" }, "stt", "ASC"]
        ],
        limit: parseInt(limit),
        offset: parseInt(parseInt(limit) * (parseInt(page) - 1))
    });
    for (let row of rows) {
        if (row.status != tripContant.TRIPSTATUS.DONE) {
            let nextCustomer = await models.TripCustomer.findOne({
                where: {
                    tripId: row.id,
                    status: {
                        [Op.in]: [tripContant.TRIPSTATUS.NOT_VISITED, tripContant.TRIPSTATUS.WAITED]
                    }
                },
                order: [["stt", "ASC"]],
                include: [{
                    model: models.Customer,
                    as: "customer",
                    attributes: ["status", "fullName", "address", "phone", "email", "code"]
                }]
            });
            if (!nextCustomer) {
                nextCustomer = row.tripCustomer[row.tripCustomer.length - 1];
            }
            row.dataValues.nextCustomer = nextCustomer;
        }
    }
    const count = await models.Trip.count({
        where
    });
    return {
        success: true,
        data: {
            items: rows,
            totalItem: count,
        },

    }
}

module.exports.getDetailTrip = async (params) => {
    const { storeId, id } = params;
    const trip = await models.Trip.findOne({
        attributes: tripAttributes,
        include: tripIncludes,
        where: {
            storeId,
            id
        },
        order: [[{ model: models.TripCustomer, as: "tripCustomer" }, "stt", "ASC"]]
    });

    const listTripCustomer = await models.TripCustomer.findAll({
        where: {
            tripId: id,
            status: {
                [Op.ne]: tripContant.TRIPSTATUS.SKIP
            }
        },
        order: [["stt", "ASC"]]
    });
    let currentIndex;
    let listPoint = listTripCustomer.map((item, index) => {
        if (item.id == trip.currentAddress) {
            currentIndex = index + 1;
        }
        return `${item.lat},${item.lng}`;
    });
    listPoint.unshift(`${trip.lat},${trip.lng}`);
    if (!trip.currentAddress) {
        currentIndex = 0;
    }

    let result = await getDistance(listPoint, currentIndex);
    for (let i = 0; i < trip.dataValues.tripCustomer.length; i++) {
        trip.dataValues.tripCustomer[i].dataValues.duration = result.durations[0][i + 1];
        trip.dataValues.tripCustomer[i].dataValues.distances = result.distances[0][i + 1];
    }
    trip.dataValues.startAddress = await reverse(trip.lng, trip.lat);
    trip.dataValues.endAddress = await reverse(trip.lngEnd, trip.latEnd);
    trip.dataValues.customerCurrent = {
        lat: trip.latCurrent,
        lng: trip.lngCurrent
    }
    return {
        success: true,
        data: trip
    }
}

const getDistance = async (listPoint, currentIndex) => {
    let points = listPoint.join("&point=");
    let API_KEY = tripContant.KEY.API_KEY;
    points = "point=" + points;
    const apiUrl = `https://maps.vietmap.vn/api/matrix?api-version=1.1&apikey=${API_KEY}&${points}&sources=${currentIndex}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    return data;
}

module.exports.updateTrip = async (params) => {
    const { name, lat, lng, time, userId, note, listCustomer, id, storeId, latEnd, lngEnd } = params;
    const userExists = await models.User.findOne({
        where: {
            storeId: storeId,
            id: userId
        }
    });

    if (!userExists) {
        return {
            error: true,
            message: "Không tìm thấy nhân viên phụ trách",
            code: HttpStatusCode.BAD_REQUEST
        }
    }

    const t = await models.sequelize.transaction(async (t) => {
        await models.Trip.update({
            name, lat, lng, time, userId, note, latEnd, lngEnd
        }, {
            where: {
                id
            },
            transaction: t
        });
        const listTripCustomerId = listCustomer.filter(item => item.tripCustomerId != null)
            .map(item => item.tripCustomerId);
        await models.TripCustomer.destroy({
            where: {
                id: {
                    [Op.notIn]: listTripCustomerId
                },
                tripId: id
            },
            transaction: t
        })
        for (const item of listCustomer) {
            if (!item.tripCustomerId) {
                const address = await reverse(item.lng, item.lat);
                await models.TripCustomer.create({
                    tripId: id,
                    customerId: item.id,
                    lat: item.lat,
                    lng: item.lng,
                    status: tripContant.TRIPSTATUS.NOT_VISITED,
                    address
                }, {
                    transaction: t
                });
            } else {
                const tripCustomer = await models.Customer.findOne({
                    where: {
                        id: item.id
                    }
                });
                if (!tripCustomer) {
                    throw new Error(`Không tồn tại khách hàng có id = ${item.id}`);
                }
                const address = await reverse(item.lng, item.lat);
                await models.TripCustomer.update({
                    customerId: item.id,
                    lng: item.lng,
                    lat: item.lat,
                    address: address
                }, {
                    where: {
                        id: item.tripCustomerId,
                        tripId: id
                    },
                    transaction: t
                });
            }
        }
    });
    await updateIndex(id);
    return {
        success: true,
        data: {}
    }
}

module.exports.changeStatus = async (params) => {
    const { tripCustomerId, status, isUpdateAddress, note } = params;
    const tripCustomer = await models.TripCustomer.findOne({
        where: {
            id: tripCustomerId
        }
    });
    const t = await models.sequelize.transaction(async (t) => {
        if (isUpdateAddress == true) {
            await models.Trip.update({
                currentAddress: tripCustomerId
            }, {
                where: {
                    id: tripCustomer.tripId
                },
                transaction: t
            });

            const key = `map_${tripCustomer.tripId}`;
            await client.set(key, JSON.stringify({
                id: tripCustomer.tripId,
                lng: tripCustomer.lng,
                lat: tripCustomer.lat
            }));
            await client.expire(key, config.redis.timeToLive);

            await models.Trip.update({
                latCurrent: tripCustomer.lat,
                lngCurrent: tripCustomer.lng
            }, {
                where: {
                    id: tripCustomer.tripId
                },
                transaction: t
            });
        }
        //Nếu là quay lại sau => đưa xuống cuối
        if (status == tripContant.TRIPSTATUS.WAITED) {
            await models.TripCustomer.update({
                status: tripContant.TRIPSTATUS.WAITED
            }, {
                where: {
                    id: tripCustomerId
                },
                transaction: t
            });
        }
        if (status == tripContant.TRIPSTATUS.VISITED) {
            await models.TripCustomer.update({
                status: tripContant.TRIPSTATUS.VISITED,
                visitedAt: new Date()
            }, {
                where: {
                    id: tripCustomerId
                },
                transaction: t
            });
        }
        //Bỏ qua
        if (status == tripContant.TRIPSTATUS.SKIP) {
            await models.TripCustomer.update({
                status: tripContant.TRIPSTATUS.SKIP,
            }, {
                where: {
                    id: tripCustomerId
                },
                transaction: t
            });
        }
    });
    if (status == tripContant.TRIPSTATUS.WAITED || status == tripContant.TRIPSTATUS.VISITED) {
        if (status == tripContant.TRIPSTATUS.WAITED) {
            await models.TripCustomer.update({
                stt: 999999
            }, {
                where: {
                    id: tripCustomerId
                }
            });
        }
        await updateIndex(tripCustomer.tripId);
    }
    if (status == tripContant.TRIPSTATUS.SKIP) {
        let stt = tripCustomer.stt;
        await models.TripCustomer.update({
            stt: null
        }, {
            where: {
                id: tripCustomerId
            },
            transaction: t
        });
        await models.TripCustomer.decrement({
            stt: 1
        }, {
            where: {
                tripId: tripCustomer.tripId,
                stt: {
                    [Op.gt]: stt
                }
            }
        });
    }
    return {
        success: true,
        data: null
    }
}

const updateIndex = async (tripId) => {
    const listCustomerVisited = await models.TripCustomer.findAll({
        where: {
            tripId,
            status: tripContant.TRIPSTATUS.VISITED
        },
        order: [["visitedAt", "ASC"]]
    });
    for (let i = 0; i < listCustomerVisited.length; i++) {
        if (listCustomerVisited[i].stt != i + 1) {
            await models.TripCustomer.update({
                stt: i + 1
            }, {
                where: {
                    id: listCustomerVisited[i].id
                }
            })
        }
    }
    let listTripCustomer = await models.TripCustomer.findAll({
        where: {
            tripId,
            status: tripContant.TRIPSTATUS.NOT_VISITED
        }
    });
    const trip = await models.Trip.findOne({
        where: {
            id: tripId
        }
    });

    let listPoint = [];
    for (const customer of listTripCustomer) {
        listPoint.push(`${customer.lat},${customer.lng}`);
    }

    if (trip.currentAddress) {
        const tripCustomerCurrent = await models.TripCustomer.findOne({
            where: {
                id: trip.currentAddress
            },
            paranoid: false
        });
        listPoint.unshift(`${tripCustomerCurrent.lat},${tripCustomerCurrent.lng}`);
    }

    if (!trip.currentAddress) {
        listPoint.unshift(`${trip.lat},${trip.lng}`);
    }
    if (listPoint.length > 1) {
        listPoint.push(`${trip.latEnd},${trip.lngEnd}`);
        console.log(listPoint);
        let res = await sortMap(listPoint);
        const countVisted = await models.TripCustomer.count({
            where: {
                status: tripContant.TRIPSTATUS.VISITED,
                tripId: tripId
            }
        });

        for (let i = 0; i < listTripCustomer.length; i++) {
            const index = res.findIndex(item => item == i + 2);
            if (index + 1 + countVisted != listTripCustomer[i].stt) {
                await models.TripCustomer.update({
                    stt: index + 1 + countVisted
                }, {
                    where: {
                        id: listTripCustomer[i].id
                    }
                })
            }
        }
    }
    const countNotWaited = await models.TripCustomer.count({
        where: {
            tripId: tripId,
            status: {
                [Op.or]: [
                    tripContant.TRIPSTATUS.NOT_VISITED,
                    tripContant.TRIPSTATUS.VISITED
                ]
            }
        }
    });
    const listCustomerWaited = await models.TripCustomer.findAll({
        where: {
            tripId: tripId,
            status: tripContant.TRIPSTATUS.WAITED
        },
        order: [["stt", "ASC"]]
    });
    for (let i = 0; i < listCustomerWaited.length; i++) {
        await models.TripCustomer.update({
            stt: countNotWaited + i + 1
        }, {
            where: {
                tripId: tripId,
                id: listCustomerWaited[i].id
            }
        })
    }
    const countNotVisited = await models.TripCustomer.count({
        where: {
            tripId: tripId,
            status: {
                [Op.or]: [
                    tripContant.TRIPSTATUS.NOT_VISITED,
                    tripContant.TRIPSTATUS.WAITED
                ]
            }
        }
    });
    if (countNotVisited == 0) {
        await models.Trip.update({
            status: tripContant.TRIPSTATUS.DONE
        }, {
            where: {
                id: tripId
            }
        });
    }
}

module.exports.searchMap = async (params) => {
    let { keyword } = params;
    let API_KEY = tripContant.KEY.API_KEY;
    keyword = encodeURIComponent(keyword);
    const apiUrl = `https://maps.vietmap.vn/api/search/v3?apikey=${API_KEY}&text=${keyword}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    return {
        success: true,
        data
    }
}

module.exports.getPlace = async (params) => {
    const { refId } = params;
    let API_KEY = tripContant.KEY.API_KEY;
    const apiUrl = `https://maps.vietmap.vn/api/place/v3?apikey=${API_KEY}&refid=${refId}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    return {
        success: true,
        data
    }
}

module.exports.reverse = async (params) => {
    const { lat, lng } = params;
    let API_KEY = tripContant.KEY.API_KEY;
    const apiUrl = `https://maps.vietmap.vn/api/reverse/v3?apikey=${API_KEY}&lng=${lng}&lat=${lat}`;
    const response = await axios.get(apiUrl);
    const address = (response.data)[0].display;

    return {
        success: true,
        data: {
            address
        }
    }
}

module.exports.geofencing = async (params) => {
    const { radius, storeId, limit = 200, page = 1 } = params;
    const lng = (params.lng).toString().trim();
    const lat = (params.lat).toString().trim();
    const where = {
        storeId,
        lat: {
            [Op.ne]: null
        },
        lng: {
            [Op.ne]: null
        }
    }
    const totalItem = await models.Customer.count({
        where
    });
    let API_KEY = tripContant.KEY.API_KEY;
    let result = [];
    for(let i = 0 ; i < Math.ceil(totalItem/parseInt(limit));i++){
        const listCustomer = await models.Customer.findAll({
            attributes: ["id", "lng", "lat"],
            where,
            limit:parseInt(limit),
            offset: i * parseInt(limit)
        });
        const listCustomerConvert = listCustomer.map(item => {
            return {
                id: `${item.id}`,
                long: (item.lng).toString().trim(),
                lat: (item.lat).toString().trim()
            }
        }).filter(item => checkDouble(item.lat) && checkDouble(item.long));

        const body = {
            geometryCenters: listCustomerConvert,
            radius,
            long: lng,
            lat:lat
        }
        const apiUrl = `https://maps.vietmap.vn/api/geofencing?apikey=${API_KEY}`;
        const response = await axios.post(apiUrl, body);
        const data = response.data.data;
        const listCustomerIdInside = (data.filter(item => item.inside == true))
            .map(item => item.id);

        const listCustomerInside = await models.Customer.findAll({
            where: {
                id: {
                    [Op.in]: listCustomerIdInside
                }
            },
            attributes: ["id", "code", "fullName", "phone", "address", "lat", "lng", "status"]
        });

        const listPoint = listCustomerInside.map(item => `${(item.lat).trim()},${(item.lng).trim()}`);
        listPoint.unshift(`${lat},${lng}`);
        let distances = (await getDistance(listPoint, 0)).distances[0];
        let tmp = listCustomerInside.map((item, index) => {
            return {
                ...item.dataValues,
                distance: distances[index + 1]
            }
        })
        result = [...result,...tmp];
    }
    result = result.sort((a,b)=>{
        return a.distance - b.distance;
    })
    return {
        success: true,
        data: result
    }
}

module.exports.deleteTrip = async (params) => {
    const { id } = params;
    const t = await models.sequelize.transaction(async (t) => {
        await models.TripCustomer.destroy({
            where: {
                tripId: id
            },
            transaction: t
        });
        await models.Trip.destroy({
            where: {
                id
            },
            transaction: t
        });
    })
    return {
        success: true,
        data: null
    }
}

module.exports.mapRouting = async (params) => {
    let { listPoint, vehicle } = params;
    listPoint = listPoint.map(item => `${item.lat},${item.lng}`);
    let points = listPoint.join("&point=");
    let API_KEY = tripContant.KEY.API_KEY;
    const apiUrl = `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${API_KEY}&point=${points}&points_encoded=false&vehicle=${vehicle}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    return {
        success: true,
        data
    }
}
