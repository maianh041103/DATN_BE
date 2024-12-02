const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  getList,
  getDetail,
  create,
  update,
  deleteDiscountProgram,
} = require("./discountProgramController");
const { createValidator } = require("./discountProgramValidator");

const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["discount_read"];
    next();
  },
  authorize,
  getList
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "discount_create";
    next();
  },
  authorize,
  createValidator,
  create
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "discount_update";
    next();
  },
  authorize,
  getDetail
);

router.put(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "discount_update";
    next();
  },
  authorize,
  createValidator,
  update
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "discount_delete";
    next();
  },
  authorize,
  deleteDiscountProgram
);

module.exports = router;
