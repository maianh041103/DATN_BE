import {addFilterByDate} from "../../helpers/utils";
import {Op} from "sequelize";

export function getFilter(params) {
    const {
        keyword,
        fromBranchId,
        toBranchId,
        branchId,
        movedBy,
        movedAt,
        status,
        receivedBy,
        receivedAt
    } = params

    const query = {}
    const where = {}
    if (keyword) {
        where.code = {
            [Op.like]: `%${keyword.trim()}%`,
        }
    }
    if (branchId) {
        where[Op.or] = {
            fromBranchId: branchId,
            toBranchId: branchId
        }
    }
    if (fromBranchId) {
        where.fromBranchId = fromBranchId
    }
    if (toBranchId) {
        where.toBranchId = toBranchId
    }
    if (movedBy) {
        where.movedBy = movedBy
    }
    if (movedAt) {
        where.movedAt = addFilterByDate([movedAt, movedAt]);
    }
    if (receivedBy) {
        where.receivedBy = receivedBy
    }
    if (receivedAt) {
        where.receivedAt = addFilterByDate([receivedAt, receivedAt])
    }
    if (status) {
        where.status = status
    }
    query.where = where
    return query
}