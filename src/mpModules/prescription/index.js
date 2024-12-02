const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  createController,
  updateController,
  deleteController,
  getController,
} = require("./prescriptionController");
const { createValidator } = require("./prescriptionValidator");
const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "prescription_read",
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
    req.apiRole = "prescription_create";
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
    req.apiRole = "prescription_update";
    next();
  },
  authorize,
  getController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "prescription_update";
    next();
  },
  authorize,
  createValidator,
  updateController
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "prescription_delete";
    next();
  },
  authorize,
  deleteController
);

module.exports = router;
