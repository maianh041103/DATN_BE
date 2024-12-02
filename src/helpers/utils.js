const moment = require("moment");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../database/models");
const { logActions, accountTypes } = require("./choices");
const { modelPermissions, actionPermissions } = require("./permission");

export async function checkObjectExist(id, model) {
  try {
    const object = await models[model].findByPk(id, {
      attributes: ["id"],
    });
    return !!object;
  } catch (e) {
    return false;
  }
}

export async function checkObjectExistAndGetValue(id, model, attributes) {
  try {
    const object = await models[model].findByPk(id, {
      attributes,
    });
    return object;
  } catch (e) {
    return false;
  }
}

export async function checkUniqueValue(model, query = {}) {
  try {
    const value = await models[model].findOne({
      attributes: ["id"],
      where: query,
    });
    return !value;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export function formatMobileToSave(mobile) {
  try {
    if (mobile && mobile.length > 8) {
      let newMobile = mobile;
      if (mobile.startsWith("84")) {
        if (mobile.length === 9) {
          newMobile = `0${mobile}`;
        } else {
          newMobile = mobile.replace("84", "0");
        }
        return newMobile;
      }
      if (mobile.startsWith("+84")) {
        newMobile = mobile.replace("+84", "0");
        return newMobile;
      }
      if (!mobile.startsWith("0")) {
        newMobile = `0${mobile}`;
        return newMobile;
      }
      // newMobile = newMobile.replace(/\D/g, '');
      return newMobile;
    }
    return mobile || "";
  } catch (e) {
    console.log("Format mobile error", e);
    return mobile;
  }
}

export function convertToSlug(alias) {
  var str = alias;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  str = str.replace(/ + /g, " ");
  str = str.trim();
  str = str.replace(/ /g, "-");
  return str;
}

export function formatEndDateTime(date) {
  if (!date || !moment(new Date(date)).isValid()) return null;
  if (moment(date, "YYYY-MM-DD HH:mm:ss", true).isValid())
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  return moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss");
}

export function formatStartDateTime(date) {
  if (!date || !moment(new Date(date)).isValid()) return null;
  if (moment(date, "YYYY-MM-DD HH:mm:ss", true).isValid())
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  return moment(date).startOf("day").format("YYYY-MM-DD HH:mm:ss");
}

export function isTimeLowerThanNow(date) {
  if (moment(new Date(date)).unix() <= moment().unix()) return true;
  return false;
}

export function addFilterByDate(filterValue) {
  let [start = "", end = ""] = filterValue;
  if (start) {
    start = `${start} 00:00:00`;
  } else {
    start = "1900-01-01 00:00:00";
  }

  if (end) {
    end = `${end} 23:59:59`;
  } else {
    end = "9999-12-31 23:59:59";
  }

  return {
    [Op.between]: [start, end],
  };
}

// format YYYY-MM-DD HH:mm:ss
export function getShiftByTime(time) {
  const { morning, afternoon, evening } = shiftTimes;

  if (!time) {
    return "other";
  }

  const calledAt = moment(time);
  const tmpArr = time.split(" ");
  const date = tmpArr[0];
  if (
    moment(`${date} ${morning.start}`) <= calledAt &&
    moment(`${date} ${morning.end}`) >= calledAt
  ) {
    return "morning";
  }
  if (
    moment(`${date} ${afternoon.start}`) <= calledAt &&
    moment(`${date} ${afternoon.end}`) >= calledAt
  ) {
    return "afternoon";
  }
  if (
    moment(`${date} ${evening.start}`) <= calledAt &&
    moment(`${date} ${evening.end}`) >= calledAt
  ) {
    return "evening";
  }
  return "other";
}

export function randomString(limit) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < limit; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export function randomStringOnlyNumber(limit) {
  let text = "";
  let possible = "0123456789";
  for (let i = 0; i < limit; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export function isValidNotIntersectTime(params) {
  try {
    let {
      format = "YYYY-MM-DD HH:mm:ss",
      startTime,
      endTime,
      newStartTime,
      newEndTime,
    } = params;

    if (!startTime || !endTime || !newStartTime || !newEndTime) {
      return false;
    }

    if (
      startTime &&
      moment(startTime, format, true).isValid() &&
      endTime &&
      moment(endTime, format, true).isValid() &&
      newStartTime &&
      moment(newStartTime, format, true).isValid() &&
      newEndTime &&
      moment(newEndTime, format, true).isValid() &&
      (moment(moment(newEndTime)).isBefore(moment(startTime)) ||
        moment(moment(newStartTime)).isAfter(moment(endTime)))
    ) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

export function isBetweenTime(params) {
  try {
    let { format = "YYYY-MM-DD HH:mm:ss", startTime, endTime, time } = params;

    if (!startTime || !endTime || !time) {
      return false;
    }

    if (
      startTime &&
      moment(startTime, format, true).isValid() &&
      endTime &&
      moment(endTime, format, true).isValid() &&
      time &&
      moment(time, format, true).isValid() &&
      (moment(moment(startTime)).isSameOrBefore(moment(time)) ||
        moment(moment(endTime)).isSameOrAfter(moment(time)))
    ) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

export function validateEmail(email) {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

export function validatePhone(phone) {
  const mobile = new RegExp(
    /^(0|\+84)((3[2-9])|(4[0-9])|(5[2689])|(7[06-9])|(8[1-9])|(9[0-46-9]))(\d)(\d{3})(\d{3})$/
  );
  return mobile.test(phone);
}

export function intersectionArrays(a, b) {
  try {
    const aMapping = {};
    for (const item of a) {
      aMapping[item] = item;
    }
    const arr = [];
    for (const item of b) {
      if (typeof aMapping[item] != "undefined") {
        arr.push(item);
      }
    }
    return arr;
  } catch (e) {
    return [];
  }
}

export function formatDecimalTwoAfterPoint(value) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function getCurrentTime(format) {
  let newDate = new Date();
  let timer = {
    H: newDate.getHours(),
    i: newDate.getMinutes(),
    s: newDate.getSeconds(),
    d: newDate.getDate(),
    m: newDate.getMonth() + 1,
    Y: newDate.getFullYear(),
    D: newDate.getDay(),
  };
  let result = format;
  for (let attr in timer) {
    let value = timer[attr];
    if (parseInt(value) < 10 && value.toString().length < 2) {
      value = "0" + value.toString();
    }
    result = result.replace(attr, value);
  }
  return result;
}

export function formatPrice(value) {
  const valueABS = Math.abs(value);
  if (isNaN(valueABS)) return value;
  if (valueABS > -1000 && valueABS < 1000) {
    return value;
  }
  const valueNumber = Intl.NumberFormat("en-US").format(valueABS);
  if (Number(value) < 0) {
    return `-${valueNumber}`;
  }
  return valueNumber;
}

export function initRolePermissions(roleId) {
  const permissions = [];
  for (const model of modelPermissions) {
    for (const action of actionPermissions) {
      permissions.push({
        model: model.name,
        action: action.name,
        roleId,
      });
    }
  }
  return permissions;
}

export function removeDiacritics(inputString) {
  return inputString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getReportType(days) {
  if (days === 0) {
    return 'hour'
  } else if (0 < days && days <= 31) {
    return 'day'
  } else if (31 < days && days <= 366) {
    return 'month'
  }
  return 'year'
}

export function checkDouble(number) {
  if (number === null || number === undefined || number === "") {
    return false;
  }
  if (!/^\d+(\.\d+)?$/.test(number)) {
    return false;
  }
  return true;
}

export function formatExcelDate(excelDate) {
  const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function checkCoordinates(string){
  if(string && string !== ""){
    if (!/^\d+(\.\d+)?$/.test(string)) {
      return false;
    }
  }
  return true;
}