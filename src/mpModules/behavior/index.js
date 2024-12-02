const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  read,
  create,
  update,
  deleteController,
  getActionHistoryList,
} = require("./behaviorController");
const { createValidator } = require("./behaviorValidator");

const express = require("express");
const router = new express.Router();

router.get(
  "/",
  // authenticate,
  // authorize,
  indexController
);

router.post(
  "/",
  authenticate,
  // authorize,
  createValidator,
  create
);

router.get(
  "/:id",
  authenticate,
  // authorize,
  read
);

router.get(
  "/log/follow",
  authenticate,
  // authorize,
  getActionHistoryList
);

router.patch("/:id", authenticate, update);

router.delete(
  "/:id",
  authenticate,
  // authorize,
  deleteController
);

module.exports = router;
