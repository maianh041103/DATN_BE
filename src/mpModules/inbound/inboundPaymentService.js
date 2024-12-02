import { HttpStatusCode } from "../../helpers/errorCodes";
const models = require("../../../database/models");
const transactionContant = require("../transaction/transactionContant");
const transactionService = require("../transaction/transactionService");
function generatePaymentCode(no) {
    if (no <= 0) return "TTNH000000000";
    if (no < 10) return `TTNH00000000${no}`;
    if (no < 100) return `TTNH0000000${no}`;
    if (no < 1000) return `TTNH000000${no}`;
    if (no < 10000) return `TTNH00000${no}`;
    if (no < 100000) return `TTNH0000${no}`;
    if (no < 1000000) return `TTNH000${no}`;
    if (no < 10000000) return `TTNH00${no}`;
    if (no < 100000000) return `TTNH0${no}`;
    if (no < 1000000000) return `TTNH${no}`;
    return no;
}

export async function indexPayment(params, loginUser) {
    let {
        page,
        limit,
        inboundId,
    } = params
    const payments = await models.Payment.findAll({
        offset: +limit * (+page - 1),
        limit: +limit,
        include: inboundIncludes,
        order: [["id", "DESC"]],
        where: {
            inboundId: inboundId,
        }

    })
    return {
        success: true,
        data: payments
    }
}
const inboundIncludes = [
    {
        model: models.User,
        as: "fullnameCreator",
        attributes: ["id", "fullName",],

    }
];
const userAttributes = [
    "id",
    "username",
    "email",
    "fullName",
    "avatarId",
    "birthday",
    "gender",
    "phone",
    "roleId",
    "position",
    "lastLoginAt",
    "createdAt",
    "status",
];
export async function indexCreatePayment(payment) {
    const inbound = await models.Inbound.findOne({
        where: {
            id: payment.inboundId
        }
    });
    if (!inbound) {
        throw Error(
            JSON.stringify({
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: msg
            })
        );
    }
    await models.sequelize.transaction(async (t) => {
        await models.Inbound.increment({
            paid: payment.amount,
            debt: -payment.amount
        }, { where: { id: inbound.id } })

        await createPayment({
            amount: payment.amount,
            totalAmount: inbound.totalPrice,
            supplierId: inbound.supplierId,
            inboundId: inbound.id,
            paymentMethod: payment.paymentMethod,
            createdBy: payment.createdBy,
            status: 'SUCCEED',
            transactionId: payment.transactionId
        }, t);
    })
    return {
        success: true
    }
}

export async function createPaymentAndTransaction(payment) {
    const inbound = await models.Inbound.findOne({
        where: {
            id: payment.inboundId
        }
    });
    if (!inbound) {
        throw Error(
            JSON.stringify({
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: msg
            })
        );
    }
    await models.sequelize.transaction(async (t) => {
        await models.Inbound.increment({
            paid: payment.amount,
            debt: -payment.amount
        }, { where: { id: inbound.id } })

        //Thêm mới transaction
        const typeTransaction = await transactionService.generateTypeTransactionInbound(inbound.storeId, t);
        const newTransaction = await models.Transaction.create({
            code: inbound.code,
            paymentDate: new Date(),
            ballotType: transactionContant.BALLOTTYPE.EXPENSES,
            typeId: typeTransaction,
            value: payment.amount,
            userId: inbound.userId,
            createdBy: payment.createdBy,
            target: transactionContant.TARGET.SUPPLIER,
            targetId: inbound.supplierId,
            isDebt: true,
            branchId: inbound.branchId,
            isPaymentOrder: true
        }, {
            transaction: t
        });

        await createPayment({
            amount: payment.amount,
            totalAmount: inbound.totalPrice,
            supplierId: inbound.supplierId,
            inbound: inbound.id,
            paymentMethod: payment.paymentMethod,
            createdBy: payment.createdBy,
            status: 'SUCCEED',
            transactionId: newTransaction.id
        }, t);
    })
    return {
        success: true
    }
}

export async function createPayment(payment, transaction) {
    const newPayment = await models.Payment.create({ ...payment, code: '' }, { transaction: transaction })
    const code = generatePaymentCode(newPayment.id)
    await models.Payment.update({
        code: code
    }, { where: { id: newPayment.id }, transaction: transaction })
}

export async function createInboundPayment(inbound, transaction) {
    if (inbound.paid > 0) {
        await createPayment({
            amount: inbound.paid,
            totalAmount: inbound.totalPrice,
            supplierId: inbound.supplierId,
            inboundId: inbound.id,
            createdBy: inbound.createdBy,
            status: 'SUCCEED',
            transactionId: inbound.transactionId
        }, transaction)
    }
}

