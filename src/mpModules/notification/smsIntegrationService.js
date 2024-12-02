const moment = require("moment");
const {
  randomStringOnlyNumber,
  validatePhone,
  addFilterByDate,
} = require("../../helpers/utils");
const { hashPassword } = require("../auth/authService");
const { errorLog } = require("../../helpers/logger");
const _ = require("lodash");
const config = require("config");
const axios = require("axios");
const models = require("../../../database/models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { NOT_ACTIVE, ACTIVE } = require("../../helpers/choices");

// forgot password
export async function sendOtp(params) {
  const { phone } = params;

  if (!validatePhone(phone)) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Số điện thoại không hợp lệ",
    };
  }

  const checkExistCustomer = await models.Customer.findOne({
    where: { phone },
  });
  if (!checkExistCustomer) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message:
        "Số điện thoại chưa tồn tại trên hệ thống, vui lòng thử lại hoặc chọn đăng ký để tạo tài khoản mới.",
    };
  }

  const currentDate = moment().format("YYYY-MM-DD");
  const count = await models.Otp.count({
    where: {
      phone,
      createdAt: addFilterByDate([currentDate, currentDate]),
    },
  });

  if (count > _.get(config, "sms.max_sms_in_date", 15)) {
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message:
        "Bạn đã yêu cầu gửi mã xác thực quá nhiều lần. Vui lòng liên hệ Hotline CSKH để được hỗ trợ.",
    };
  }

  const randomCode = randomStringOnlyNumber(4);

  const content = `${_.get(
    config,
    "sms.brandName"
  )} - Ma xac nhan cua ban tai ${_.get(
    config,
    "sms.domain"
  )} la: ${randomCode}`;

  await models.Otp.create({
    phone,
    otp: randomCode,
    status: NOT_ACTIVE,
    createdAt: new Date(),
  });

  const res = await sendNotificationThroughSms({ phone, content });

  if (res && res.success) {
    return {
      success: true,
    };
  }

  return {
    error: true,
    code: HttpStatusCode.SYSTEM_ERROR,
    message: "Hệ thống gửi tin đang bị gián đoạn",
  };
}

export async function sendOtpToPhone(params) {
  const { phone } = params;

  if (!validatePhone(phone)) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Số điện thoại không hợp lệ",
    };
  }

  const currentDate = moment().format("YYYY-MM-DD");
  const count = await models.Otp.count({
    where: {
      phone,
      createdAt: addFilterByDate([currentDate, currentDate]),
    },
  });

  if (count > _.get(config, "sms.max_sms_in_date", 15)) {
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message:
        "Bạn đã yêu cầu gửi mã xác thực quá nhiều lần. Vui lòng liên hệ Hotline CSKH để được hỗ trợ.",
    };
  }

  const randomCode = randomStringOnlyNumber(4);

  const content = `${_.get(
    config,
    "sms.brandName"
  )} - Ma xac nhan cua ban tai ${_.get(
    config,
    "sms.domain"
  )} la: ${randomCode}`;

  const [otpCre, res] = await Promise.all([
    models.Otp.create({
      phone,
      otp: randomCode,
      status: NOT_ACTIVE,
      createdAt: new Date(),
    }),
    sendNotificationThroughSms({ phone, content }),
  ]);

  if (res && res.success) {
    return {
      success: true,
    };
  }

  return {
    error: true,
    code: HttpStatusCode.SYSTEM_ERROR,
    message: "Hệ thống gửi tin đang bị gián đoạn",
  };
}

export async function sendNotificationThroughSms(params) {
  const { phone, content } = params;

  const apiKey = _.get(config, "sms.apiKey");
  const secretKey = _.get(config, "sms.secretKey");
  const baseUrl = _.get(config, "sms.baseUrl");
  const brandName = _.get(config, "sms.brandName");

  const res = await axios({
    method: "get",
    url: ``,
    headers: {
      "Content-Type": "application/json",
      "cache-control": "no-cache",
    },
  });

  if (res && _.get(res, "data.CodeResult") == 100) {
    return {
      success: true,
    };
  }

  errorLog(
    params,
    `smsIntegrationService::sendNotificationThroughSms ${JSON.stringify(res)}`
  );

  return {
    error: true,
    code: HttpStatusCode.SYSTEM_ERROR,
    message: "Something went wrong while sending message via sms",
  };
}

export async function updatePasswordByOtp(params) {
  const { phone, otp, password } = params;

  if (!validatePhone(phone)) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Số điện thoại không hợp lệ",
    };
  }

  if (!password) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Mật khẩu không hợp lệ",
    };
  }

  const checkExistCustomer = await models.Customer.findOne({
    attributes: ["id"],
    where: { phone },
  });
  if (!checkExistCustomer) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message:
        "Số điện thoại chưa tồn tại trên hệ thống, vui lòng thử lại hoặc chọn đăng ký để tạo tài khoản mới.",
    };
  }

  const lastestOtp = await models.Otp.findOne({
    attributes: ["id", "otp"],
    where: {
      phone,
      status: NOT_ACTIVE,
    },
    order: [["id", "DESC"]],
    raw: true,
  });

  if (!lastestOtp) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Mã xác nhận chưa được gửi",
    };
  }

  if (lastestOtp.otp != otp) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "OTP không hợp lệ",
    };
  }

  await Promise.all([
    models.Customer.update(
      {
        password: hashPassword(password),
        timeTokenInactive: new Date(),
      },
      {
        where: {
          id: checkExistCustomer.id,
        },
      }
    ),
    models.Otp.update(
      { status: ACTIVE },
      {
        where: {
          id: lastestOtp.id,
        },
      }
    ),
  ]);

  return {
    success: true,
  };
}
