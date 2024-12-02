// 'use strict';
//
// const redis = require("redis");
// const config = require("config");
// const redisConfig = config.get('redis') || {};
//
// const client = redis.createClient({
//     username: redisConfig.username,
//     password: redisConfig.password,
//     socket: {
//         host: redisConfig.host,
//         port: redisConfig.port,
//         tls: false,
//     },
//     connectTimeout: 10000 // in milliseconds
// });
// client.on('error', err => console.log('Redis Client Error', err));
// client.connect();
// module.exports = { client };
