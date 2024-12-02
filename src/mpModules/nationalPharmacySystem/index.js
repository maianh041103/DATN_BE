const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  createController,
  updateController,
  deleteController,
  readController,
} = require("./npsController");
const { createValidator, updateValidator } = require("./npsValidator");

const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "nps_read",
      "dashboard_read",
      "customer_read",
      "discount_read",
    ];
    next();
  },
  authorize,
  indexController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "nps_create";
    next();
  },
  authorize,
  createValidator,
  createController
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "nps_update";
    next();
  },
  authorize,
  readController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "nps_update";
    next();
  },
  authorize,
  updateValidator,
  updateController
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "nps_delete";
    next();
  },
  authorize,
  deleteController
);

module.exports = router;
