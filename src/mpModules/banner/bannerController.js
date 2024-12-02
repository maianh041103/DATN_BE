const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readBanner,
  indexBanners,
  updateBanner,
  createBanner,
  deleteBanner,
} = require("./bannerService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function getList(req, res) {
  try {
    const result = await indexBanners(req.query);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function create(req, res) {
  try {
    console.log(req.body);
    let listBanner = [];
    for(const item of req.body){
      const banner = {
        title: _.get(item, "title", ""),
        alt: _.get(item, "alt", ""),
        imageId: _.get(item, "imageId", null),
        displayOrder: _.get(item, "displayOrder", ""),
        link: _.get(item, "link", ""),
        type: _.get(item, "type", ""),
        description: _.get(item, "description", ""),
        sponsor: _.get(item, "sponsor", ""),
        status: _.get(item, "status", null),
        createdAt: new Date(),
      };
      listBanner.push(banner);
    }
    const result = await createBanner(listBanner);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function getDetail(req, res) {
  try {
    const { id } = req.params;
    const result = await readBanner(id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function update(req, res) {
  try {
    const listBanner = [];
    for(const item of req.body){
      const banner = {
        id: _.get(item, "id", null),
        title: _.get(item, "title", ""),
        alt: _.get(item, "alt", ""),
        imageId: _.get(item, "imageId", null),
        displayOrder: _.get(item, "displayOrder", ""),
        link: _.get(item, "link", ""),
        type: _.get(item, "type", ""),
        description: _.get(item, "description", ""),
        sponsor: _.get(item, "sponsor", ""),
        status: _.get(item, "status", null),
        createdAt: new Date(),
      };
      listBanner.push(banner);
    }

    const result = await updateBanner(listBanner);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function deleteController(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteBanner(id);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}
