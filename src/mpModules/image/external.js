const {
  uploadImage
} = require("./imageController");

const express = require("express");

const router = new express.Router();

router.post("/", uploadImage);

module.exports = router;
