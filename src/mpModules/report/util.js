import moment from "moment/moment";
import {getReportType} from "../../helpers/utils";
import {Op} from "sequelize";

export function groupByField(field, from, to) {
    const fromDate = moment(from);
    const toDate = moment(to);
    const days = toDate.diff(fromDate, 'days');
    const type = getReportType(days)
    switch (type) {
        case 'hour':
            return `DATE_FORMAT(${field}, '%H:00')`
        case 'day':
            return `DATE_FORMAT(${field}, '%d-%m-%Y')`
        case 'month':
            return `DATE_FORMAT(${field}, '%m-%Y')`
        case 'year':
            return `DATE_FORMAT(${field}, '%Y')`
        default:
            return `DATE_FORMAT(${field}, '%d-%m-%Y')`
    }
}

export function getFilter(from, to, branchId) {
    return {
        createdAt: {
            [Op.and]: {
                [Op.gte]: moment(from).startOf("day"),
                [Op.lte]: moment(to).endOf("day")
            }
        },
        branchId: branchId
    }
}

export function getFilterStore(from, to, storeId) {
    return {
        createdAt: {
            [Op.and]: {
                [Op.gte]: moment(from).startOf("day"),
                [Op.lte]: moment(to).endOf("day")
            }
        },
        storeId: storeId
    }
}