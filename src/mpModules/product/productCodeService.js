import {productTypes} from "./productConstant";
import {stat} from "@babel/core/lib/gensync-utils/fs";
const models = require("../../../database/models");
export async function insertNewCode(storeId) {
    let payloads = []
    for (const type of Object.values(productTypes)) {
        payloads.push({
            storeId: storeId,
            type: type,
            value: 0
        })
    }
    await models.Codes.bulkCreate(payloads);
}

export async function insert(storeId, type) {
    return await models.Codes.create({
        storeId: storeId,
        type: type,
        value: 0
    });
}

export async function updateCode(storeId, type, value) {
    await models.Codes.update(
        {value: value} ,
        {where: { storeId: storeId, type: type }}
    )
}

export async function getNextValue(storeId, type) {
    let code = await models.Codes.findOne({
        attributes: ['value'],
        where: {
            storeId: storeId,
            type: type
        }
    })
    if (!code) {
        console.log(`insertNewCode for store ${storeId}`)
        await insert(storeId, type)
    }
    await models.Codes.increment(
        {value: 1},
        {where: { storeId: storeId, type: type }}
    )
    const newCode =  await models.Codes.findOne({
        attributes: ['value'],
        where: {
            storeId: storeId,
            type: type
        }
    });
    return newCode.value
}

export async function getNextValueTransactione(storeId, type, t) {
    let code = await models.Codes.findOne({
        attributes: ['value'],
        where: {
            storeId: storeId,
            type: type
        },
        transaction: t
    })
    if (!code) {
        await models.Codes.create({
            storeId: storeId,
            type: type,
            value: 0
        },
            {
                transaction: t
            });
    }
    await models.Codes.increment(
        {value: 1},
        {
            where: {
                storeId: storeId,
                type: type
            },
            transaction: t
        }
    )
    const newCode =  await models.Codes.findOne({
        attributes: ['value'],
        where: {
            storeId: storeId,
            type: type
        },
        transaction:t
    });
    return newCode.value
}