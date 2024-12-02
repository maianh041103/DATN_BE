const _ = require("lodash");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const models = require("../../../database/models");
const { checkUniqueValue } = require("../../helpers/utils");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const { accountTypes, logActions } = require("../../helpers/choices");
const { createUserTracking } = require("../behavior/behaviorService");

const attributes = ["id", "name", "description", "storeId", "createdAt"];

export async function isExistRole(id) {
  return !!(await models.Role.findOne({ where: { id } }));
}

export async function indexRoles(filter) {
  const { page = 1, limit = 10, keyword = "", storeId } = filter;
  const query = {
    attributes,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["id", "DESC"]],
  };
  const where = { storeId };
  if (keyword) {
    where[Op.or] = {
      name: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      description: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  query.where = where;
  const { rows, count } = await models.Role.findAndCountAll(query);
  return {
    success: true,
    data: {
      items: rows,
      totalItem: count,
    },
  };
}

export async function createRole(role) {
  const findRole = await models.Role.findOne({
    attributes: ["id"],
    where: {
      name: role.name,
      storeId: role.storeId,
    },
  });
  if (findRole) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Nhóm quyền ${role.name} đã tồn tại, hãy tạo nhóm quyền có tên khác.`,
    };
  }

  const newRole = await models.Role.create(role);
  const { permissions = [] } = role;

  await models.RolePermission.bulkCreate(
    permissions.map((p) => ({
      model: p.model,
      action: p.action,
      roleId: newRole.id,
      createdBy: role.createdBy,
      updatedBy: role.updatedBy,
    }))
  );

  createUserTracking({
    accountId: newRole.createdBy,
    type: accountTypes.USER,
    objectId: newRole.id,
    action: logActions.role_create.value,
    data: newRole,
  });

  return {
    success: true,
    data: newRole,
  };
}

export async function updateRole(id, role, loginUser) {
  const foundRole = await models.Role.findOne({
    attributes: ["id"],
    where: {
      id,
      storeId: loginUser.storeId,
    },
    raw: true,
  });
  if (!foundRole) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm quyền không tồn tại",
    };
  }
  // check name is unique?
  const result = await checkUniqueValue("Role", {
    storeId: loginUser.storeId,
    id: {
      [Op.ne]: id,
    },
    name: role.name,
  });
  if (result) {
    await models.Role.update(role, {
      where: {
        id,
      },
    });

    createUserTracking({
      accountId: role.updatedBy,
      type: accountTypes.USER,
      objectId: id,
      action: logActions.role_update.value,
      data: { id, ...role },
    });

    // delete old role permissions
    await models.RolePermission.destroy(
      {
        where: {
          roleId: id,
        },
      },
      {
        force: true,
      }
    );

    const { permissions = [] } = role;

    await models.RolePermission.bulkCreate(
      permissions.map((p) => ({
        model: p.model,
        action: p.action,
        roleId: id,
        createdBy: role.createdBy,
        updatedBy: role.updatedBy,
        warehouse: role.warehouse,
      }))
    );

    return {
      success: true,
    };
  }
  return {
    error: true,
    code: HttpStatusCode.BAD_REQUEST,
    message: `Nhóm quyền ${role.name} đã tồn tại, hãy tạo vị trí có tên khác.`,
  };
}

export async function getRoleDetail(id, storeId) {
  const findRole = await models.Role.findByPk(id, {
    attributes,
    include: [
      {
        model: models.RolePermission,
        as: "permissions",
        attributes: ["id", "model", "action"],
      },
    ],
  });
  if (!findRole || findRole.storeId !== storeId) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm quyền không tồn tại",
    };
  }
  return {
    success: true,
    data: findRole,
  };
}

export async function deleteRoleById(id, loginUser) {
  const findRole = await models.Role.findOne({
    attributes: ["id", "name", "storeId"],
    include: [
      {
        model: models.User,
        as: "users",
        attributes: ["id"],
      },
    ],
    where: {
      id,
      storeId: loginUser.storeId,
    }
  });

  if (!findRole) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Nhóm quyền không tồn tại",
    };
  }

  const { users = [] } = findRole;
  if (!_.isEmpty(users)) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: "Nhóm quyền đang được sử dụng, không thể xóa",
    };
  }

  await models.Role.destroy({
    where: {
      id,
    },
  });

  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: findRole.id,
    action: logActions.role_delete.value,
    data: { id, name: findRole.name, storeId: findRole.storeId },
  });

  return {
    success: true,
  };
}
