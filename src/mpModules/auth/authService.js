const _ = require("lodash");
const models = require("../../../database/models");
const bCrypt = require("bcrypt");
const {
  userStatus,
  accountTypes,
  logActions,
} = require("../../helpers/choices");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { signToken } = require("../../lib/jwt/service");
const {
  formatMobileToSave,
  checkUniqueValue,
  initRolePermissions,
} = require("../../helpers/utils");
const { createUserTracking } = require("../behavior/behaviorService");
const { isExistStore } = require("../store/storeService");
const { userPositions } = require("../user/userConstant.js");
const otpGenerate = require("../../helpers/otpGenerate.js");
const nodemailer = require("nodemailer");
const config = require("config");
const configEmail = config.get("email");
const { email } = require("./email.js");

const userIncludes = [
  {
    model: models.Image,
    as: "avatar",
    attributes: ["id", "originalName", "fileName", "filePath", "path"],
  },
  {
    model: models.Store,
    as: "store",
    attributes: [
      "id",
      "name",
      "phone",
      "provinceId",
      "districtId",
      "wardId",
      "address",
      "createdAt",
        "isAgency"
    ],
    include: [
      {
        model: models.Province,
        as: "province",
        attributes: ["id", "name"],
      },
      {
        model: models.District,
        as: "district",
        attributes: ["id", "name"],
      },
      {
        model: models.Ward,
        as: "ward",
        attributes: ["id", "name"],
      },
    ],
  },
  {
    model: models.UserBranch,
    as: "branches",
    attributes: ["id"],
    include: [{
      model: models.Branch,
      as: "branch",
      attributes: [
        "id",
        "name",
        "phone",
        "code",
        "zipCode",
        "provinceId",
        "districtId",
        "wardId",
        "isDefaultBranch",
        "createdAt",
      ],
      include: [
        {
          model: models.Province,
          as: "province",
          attributes: ["id", "name"],
        },
        {
          model: models.District,
          as: "district",
          attributes: ["id", "name"],
        },
        {
          model: models.Ward,
          as: "ward",
          attributes: ["id", "name"],
        },
      ],
    }]
  },
  {
    model: models.Role,
    as: "role",
    attributes: ["id", "name", "description"],
    include: [
      {
        model: models.RolePermission,
        as: "permissions",
        attributes: ["id", "model", "action"],
      },
    ],
  },
];

function isValidPassword(userPassword, password) {
  return bCrypt.compareSync(password, userPassword);
}

export function hashPassword(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
}

export async function login(credentials) {
  const { username, password } = credentials;
  const user = await models.User.findOne({
    attributes: [
      "id",
      "username",
      "password",
      "email",
      "birthday",
      "gender",
      "fullName",
      "phone",
      "roleId",
      "storeId",
      "position",
    ],
    include: userIncludes,
    where: {
      username,
      status: userStatus.ACTIVE,
    },
  });

  if (!user) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Tài khoản không được tìm thấy",
    };
  }

  if (!isValidPassword(user.password, password)) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Tên đăng nhập hoặc mật khẩu không đúng",
    };
  }

  // sign token
  const token = signToken(
    {
      userId: user.id,
      phone: user.phone,
      email: user.email,
      storeId: user.storeId
    },
    "sign"
  );
  const rToken = signToken(
    {
      userId: user.id,
      phone: user.phone,
      email: user.email,
      storeId: user.storeId
    },
    "refresh"
  );
  const profile = {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    position: user.position,
    store: user.store,
    branches: user.branches,
    avatar: user.avatar,
    birthday: user.birthday,
    gender: user.gender,
    role: user.role,
  };

  models.User.update(
    {
      lastLoginAt: new Date(),
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  return {
    success: true,
    data: {
      accessToken: {
        token,
      },
      refreshToken: {
        token: rToken,
      },
      profile,
    },
  };
}

export async function createAccount(credentials) {
  const { username, password, fullName, email, storeId } =
    credentials;

  const existedStore = await isExistStore(storeId);
  if (!existedStore) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Store có id = ${storeId} không tồn tại`,
    };
  }

  const findUserByStoreId = await models.User.findOne({
    where: {
      storeId,
      isAdmin: true
    },
    raw: true,
  });

  if (findUserByStoreId) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Store có id = ${storeId} đã thiết lập chủ sở hữu. Hãy tạo một cửa hàng riêng cho bạn`,
    };
  }

  const phone = formatMobileToSave(credentials.phone);
  const existsPhoneUser = await models.User.findOne({
    where:{
      phone
    }
  });

  if(existsPhoneUser){
    return{
      error:true,
      message:`Số điện thoại ${phone} đã tồn tại`,
      code: HttpStatusCode.BAD_REQUEST
    }
  }
  const user = await models.User.findOne({
    where: {
      phone,
      storeId,
    },
    raw: true,
  });

  if (user) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Số điện thoại đã được đăng ký",
    };
  }

  const isExistedUsername = await models.User.findOne({
    where: {
      username,
    },
    raw: true,
  });

  if (isExistedUsername) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Tên tài khoản đã được sử dụng",
    };
  }

  // create administrator role
  const role = {
    name: `Administrator - Store có id = ${storeId}`,
    description: `Quản lý toàn bộ dữ liệu thuộc về cửa hàng`,
    storeId,
  };
  const isUniqueValue = await checkUniqueValue("Role", {
    name: role.name,
    storeId,
  });
  if (!isUniqueValue) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Tên nhóm quyền ${role.name} đã tồn tại, hãy tạo lại cửa hàng.`,
    };
  }

  const newRole = await models.Role.create(role);
  await models.RolePermission.bulkCreate(initRolePermissions(newRole.id));

  const newUser = await models.User.create({
    username,
    email,
    phone,
    fullName,
    password: hashPassword(password),
    position: userPositions.ADMIN,
    storeId,
    roleId: newRole.id,
    isAdmin: true
  });

  return {
    success: true,
    data: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      fullName: newUser.fullName,
      position: newUser.position,
    },
  };
}

export async function updatePassword(credentials) {
  const { oldPassword, newPassword, reNewPassword, userId } = credentials;
  const currentUser = await models.User.findByPk(userId);
  if (
    !isValidPassword(currentUser.password, oldPassword, currentUser.user_name)
  ) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Mật khẩu cũ không đúng",
    };
  }

  if (newPassword !== reNewPassword) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Mật khẩu được nhập lại không đúng",
    };
  }

  if (oldPassword === newPassword) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Mật khẩu mới trùng mật khẩu cũ",
    };
  }

  await models.User.update(
    {
      password: hashPassword(newPassword, currentUser.user_name),
      updatedAt: new Date(),
    },
    {
      where: {
        id: userId,
      },
    }
  );

  createUserTracking({
    accountId: userId,
    type: accountTypes.USER,
    objectId: userId,
    action: logActions.auth_update.value,
    data: { id: userId },
  });

  return {
    success: true,
  };
}

export async function readUserProfile(userId) {
  const user = await models.User.findByPk(userId, {
    attributes: [
      "id",
      "username",
      "email",
      "fullName",
      "birthday",
      "gender",
      "phone",
      "roleId",
      "storeId",
      "position",
        "isAdmin"
    ],
    include: userIncludes,
  });

  return {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      position: user.position,
      store: user.store,
      avatar: user.avatar,
      birthday: user.birthday,
      gender: user.gender,
      role: user.role,
      branches: user.branches,
      isAdmin: user.isAdmin
    },
  };
}

export async function updateUserProfile(userId, payload) {
  const { fullName, email, gender, birthday, avatarId } = payload;

  await models.User.update(
    {
      fullName,
      email,
      birthday,
      gender,
      avatarId,
    },
    {
      where: {
        id: userId,
      },
    }
  );

  createUserTracking({
    accountId: userId,
    type: accountTypes.USER,
    objectId: userId,
    action: logActions.auth_update.value,
    data: {
      id: userId,
      fullName,
      email,
      birthday,
      gender,
      avatarId,
    },
  });

  return {
    success: true,
  };
}

const transporter = nodemailer.createTransport(
    configEmail
);


export async function checkEmail(params) {
  try {
    const user = await models.User.findOne({
      where: {
        email: params.email
      }
    });
    if (!user) {
      return {
        error: true,
        code: HttpStatusCode.NOT_FOUND,
        message: "Tài khoản không được tìm thấy",
      };
    }
    const otp = otpGenerate.otp(6);
    await models.OtpEmail.create({
      email: params.email,
      status: "active",
      otp: otp
    });
    const info = await transporter.sendMail({
      from: 'nguyenmaianh041103@gmail.com',
      to: params.email,
      subject: "Lấy lại mật khẩu Mephar",
      text: `Text...`,
      html: email(otp),
    });
  } catch (error) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Lỗi trong quá trình gửi mail",
    }
  }

  return {
    success: true,
    data: null
  }
}

export async function checkOtp(params) {
  const otp = params.otp;
  const email = params.email;
  const otpExists = await models.OtpEmail.findOne({
    where: {
      otp, email,
      status: "active"
    }
  });
  if (!otpExists) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Mã OTP không hợp lệ",
    };
  }
  return {
    success: true,
    data: null
  }
}

export async function changePassword(params) {
  const { email, newPassword, reNewPassword } = params;
  if (newPassword != reNewPassword) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Mật khẩu nhập lại không đúng",
    }
  }
  await models.User.update({
    password: hashPassword(newPassword)
  }, {
    where: {
      email: email
    }
  })
  return {
    success: true,
    data: null
  }
}
