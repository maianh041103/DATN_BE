const _ = require("lodash");
const moment = require("moment");
const config = require("config");
const path = require("path");
const multer = require("multer");
const { storage } = require("./imageContants");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const { insertImage, readImage } = require("./imageService");
const imagesFolder = config.get("api.imagesFolder") || "/upload/images";

const fileController = multer({
  storage,
  fileFilter: (req, file, callback) => {
    const { mimetype } = file;
    if (!mimetype.startsWith("image")) {
      return callback(new Error("Only image are allowed"));
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 104857600, // Bytes ~ 100MB
  },
}).single("file");

const fileControllers = multer({
  storage,
  fileFilter: (req, files, callback) => {
    const { mimetype } = files;
    if (!mimetype.startsWith("image")) {
      return callback(new Error("Only image are allowed"));
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 10 * 104857600,
  },
}).array("files");

export function uploadImage(req, res) {
  fileController(req, res, async (err) => {
    if (err) {
      res.send(
        respondWithError(
          HttpStatusCode.BAD_REQUEST,
          "Upload file error!",
          err.message
        )
      );
      return;
    }
    if (!req.file) {
      res.send(
        respondWithError(HttpStatusCode.BAD_REQUEST, "File is required!")
      );
      return;
    }
    const subFolder = moment().format("YYYY-MM-DD");
    const file = {
      originalName: _.get(req, "file.originalname", ""),
      fileName: _.get(req, "file.filename", ""),
      mimetype: _.get(req, "file.mimetype", ""),
      extension: path.extname(_.get(req, "file.filename", "")),
      path: `${imagesFolder}/${subFolder}/${_.get(req, "file.filename", "")}`,
      createdBy: _.get(req, "loginUser.id", null),
    };
    try {
      const result = await insertImage(file);
      res.json(respondItemSuccess(result));
    } catch (error) {
      res.json(
        respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
      );
    }
  });
}

export function uploadImages(req, res) {
  fileControllers(req, res, async (err) => {
    if (err) {
      res.send(
        respondWithError(
          HttpStatusCode.BAD_REQUEST,
          "Upload files error!",
          err.message
        )
      );
      return;
    }
    if (!req.files) {
      res.send(
        respondWithError(HttpStatusCode.BAD_REQUEST, "Files is required!")
      );
      return;
    }
    const { files } = req;
    const results = [];
    const outputErrors = [];
    let reqFile;
    let file;
    const subFolder = moment().format("YYYY-MM-DD");
    for (let i = 0; i < files.length; i += 1) {
      reqFile = files[i];
      file = {
        originalName: _.get(reqFile, "originalname", ""),
        fileName: _.get(reqFile, "filename", ""),
        mimetype: _.get(reqFile, "mimetype", ""),
        extension: path.extname(_.get(reqFile, "filename", "")),
        path: `${imagesFolder}/${subFolder}/${_.get(reqFile, "filename", "")}`,
        createdBy: _.get(req, "loginUser.id", null),
      };
      try {
        results.push(insertImage(file));
      } catch (error) {
        outputErrors.push(error);
      }
    }
    const images = await Promise.all(results);

    if (outputErrors.length) {
      const error = outputErrors[0];
      res.json(
        respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
      );
    } else {
      res.json(respondItemSuccess(images));
    }
  });
}

export async function readImageController(req, res) {
  try {
    const result = await readImage(req.params.id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
