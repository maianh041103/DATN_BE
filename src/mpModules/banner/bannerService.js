const { createUserTracking } = require("../behavior/behaviorService");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { Op } = Sequelize;
const models = require("../../../database/models");
const {
  typeOptions,
  accountTypes,
  logActions,
} = require("../../helpers/choices");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const include = [
      {
        model: models.Image,
        as: "image",
        attributes: ["id", "originalName", "fileName", "filePath", "path"],
      },
    ];

function processQuery(params) {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    type,
    status,
  } = params;
  const include = [
    {
      model: models.Image,
      as:"image"
    }
  ]
  const query = {
    include,
    offset: +limit * (+page - 1),
    limit: +limit,
    order: [["displayOrder", "ASC"]],
  };
  const where = {};
  if (keyword) {
    where[Op.or] = {
      title: {
        [Op.like]: `%${keyword.trim()}%`,
      },
      description: {
        [Op.like]: `%${keyword.trim()}%`,
      },
    };
  }
  if (type) {
    where.type = type;
  }
  if (typeof status !== "undefined") {
    where.status = status;
  }
  query.where = where;
  return query;
}

export async function bannerFilter(params) {
  try {
    return await models.Banner.findAll(processQuery(params));
  } catch (e) {
    return [];
  }
}

export async function indexBanners(params) {
  const query = processQuery(params);
  const { rows, count } = await models.Banner.findAndCountAll(query);
  return {
    success: true,
    data: {
      list_banner: rows,
      totalItem: count,
      list_type_banner: typeOptions,
    },
  };
}

export async function createBanner(params) {
  await models.Banner.bulkCreate(params);
  return {
    success: true,
    data: params,
  };
}

export async function updateBanner(params) {
  const listBannerId = params.filter(item=>item.id !== undefined && item.id !== null)
      .map(item => item.id);
  const t = await models.sequelize.transaction(async (t)=>{
    await models.Banner.destroy({
      where:{
        id:{
          [Op.notIn]: listBannerId,
        }
      },
      transaction:t
    });
    for(const banner of params){
      if(banner.id){
        await models.Banner.update(banner, {
          where: {
            id:banner.id,
          },
          transaction:t
        });
      }
      else{
        await models.Banner.create(banner,{
          transaction:t
        });
      }
    }
  })

  return {
    success: true,
  };
}

export async function readBanner(id) {
  return {
    success: true,
    data: await models.Banner.findOne({
      where:{
        id
      },
      include
    })
  };
}

export async function deleteBanner(id) {
  const instance = await models.Banner.findByPk(id, {
    attributes: ["id", "title"],
  });

  if (!instance) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: "Banner không tồn tại",
    };
  }

  await models.Banner.destroy({
    where: {
      id,
    },
  });

  return {
    success: true,
  };
}
