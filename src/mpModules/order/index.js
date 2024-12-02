const { authenticate } = require("../../middlewares/auth");

const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  readController,
  createController,
  updateController,
  deleteController,
  updateStatus,
  // exportOrder,
  // getEndDate,
  // confirmPayment,
  getProductCustomer,
  getOrderHistory, readPaymentController, createPaymentController,
  getOrderDiscount
} = require("./orderController");
const {
  createValidator,
  updateStatusValidator,
  updateValidator,
} = require("./orderValidator");

const express = require("express");
const router = express.Router();

router.get(
  "/:id/fill-product",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["order_read", "order_view_all"];
    next();
  },
  authorize,
  getProductCustomer
);

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["order_read", "order_view_all"];
    next();
  },
  authorize,
  indexController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "order_create";
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
    req.apiRole = "order_read";
    next();
  },
  authorize,
  readController
);

router.get(
  "/:id/payment-history",
  authenticate,
  (req, res, next) => {
    req.apiRole = "order_read";
    next();
  },
  authorize,
  readPaymentController
);

router.post(
  "/:id/payment",
  authenticate,
  (req, res, next) => {
    req.apiRole = "order_create";
    next();
  },
  authorize,
  createPaymentController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "order_update";
    next();
  },
  authorize,
  // authorizeOrderDetail,
  // updateValidator,
  updateController
);

router.patch(
  "/:id/status",
  authenticate,
  (req, res, next) => {
    req.apiRole = "order_update";
    next();
  },
  authorize,
  updateStatusValidator,
  updateStatus
);

router.delete('/:id',
  authenticate,
  (req, res, next) => { req.apiRole = 'order_delete'; next(); },
  authorize,
  deleteController
);

// Xác nhận thanh toán
// router.post('/confirm-payment',
// authenticate,
// (req, res, next) => { req.apiRole = 'order_update'; next(); },
// authorize,
// confirmPayment
// );

router.get(
  "/extract/log",
  authenticate,
  (req, res, next) => {
    req.apiRole = "order_history_read";
    next();
  },
  authorize,
  getOrderHistory
);

router.get("/:id/get-discount",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["order_read", "order_view_all"];
    next();
  },
  authorize,
  getOrderDiscount)

module.exports = router;
