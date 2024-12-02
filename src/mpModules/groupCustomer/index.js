const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexGroupCustomersController,
  readController,
  createController,
  updateController,
  deleteController,
} = require("./groupCustomerController");
const { createValidator } = require("./groupCustomerValidator");
const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "group_customer_read",
      "dashboard_read",
      "customer_read",
      "discount_read",
      "product_link_customer_user_read",
    ];
    next();
  },
  authorize,
  indexGroupCustomersController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "group_customer_create";
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
    req.apiRole = "group_customer_update";
    next();
  },
  authorize,
  readController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "group_customer_update";
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
    req.apiRole = "group_customer_delete";
    next();
  },
  authorize,
  deleteController
);

module.exports = router;
