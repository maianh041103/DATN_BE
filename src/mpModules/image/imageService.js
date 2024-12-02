const _ = require("lodash");
const models = require("../../../database/models");
const config = require("config");
const apiServer = _.get(config, "api.apiServer", "");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function insertImage(newImage) {
  return await models.Image.create(newImage);
}

export async function fetchImages(params) {
  try {
    const { imageId } = params;
    const conditions = {};

    if (imageId) conditions.id = imageId;

    return (
      await models.Image.findAll({
        attributes: ["id", "originalName", "fileName", "filePath", "path"],
        where: conditions,
        raw: true,
      })
    ).map((o) => {
      return {
        ...o,
        filePath: `${apiServer}${o.path}`,
      };
    });
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function readImage(id) {
  const findImage = await models.Image.findOne({
    where: {
      id,
    },
  });
  if (!findImage) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: `Ảnh không tồn tại`,
    };
  }
  return {
    success: true,
    data: findImage,
  };
}
