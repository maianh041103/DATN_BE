const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  getList,
  getDetail,
  create,
  update,
  deleteController,
} = require("./bannerController");
const { createValidator } = require("./bannerValidator");

const express = require("express");

const router = new express.Router();

router.get("/", getList);

router.post("/", create);

router.get("/:id", getDetail);

router.patch("", update);

router.delete("/:id", deleteController);

module.exports = router;
