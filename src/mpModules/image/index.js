const { authenticate } = require("../../middlewares/auth");
const {
  uploadImage,
  uploadImages,
  readImageController,
} = require("./imageController");

const express = require("express");

const router = new express.Router();

router.post("/", authenticate, uploadImage);
router.get("/:id", readImageController);
router.post("/uploads", authenticate, uploadImages);

module.exports = router;
