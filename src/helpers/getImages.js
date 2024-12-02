const models = require("../../database/models");
const Sequelize = require("sequelize");
const {Op} = Sequelize;

module.exports.getImages = async (images = "") => {
    if(images !== null){
        const imageIds = images.split("/");
        const listImages = await models.Image.findAll({
            where: {
                id: {[Op.in]: imageIds}
            },
            attributes: ["id", "filePath", "originalName", "path", "fileName"]
        });
        return listImages;
    }
    return null;
}