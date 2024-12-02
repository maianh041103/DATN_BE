const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexGroupProductsController,
  createController,
  updateController,
  deleteController,
  getController,
} = require("./groupProductController");
const { createValidator } = require("./groupProductValidator");
const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "group_product_read",
      "dashboard_read",
      "customer_read",
      "discount_read",
      "product_link_customer_user_read",
    ];
    next();
  },
  authorize,
  indexGroupProductsController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "group_product_create";
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
    req.apiRole = "group_product_update";
    next();
  },
  authorize,
  getController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "group_product_update";
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
    req.apiRole = "group_product_delete";
    next();
  },
  authorize,
  deleteController
);

module.exports = router;
