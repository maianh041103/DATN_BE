const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  readController,
  createController,
  updateController,
  updateStatus,
  getProductCustomer, indexDelete,
    createPaymentController,
    exportInboundController
  // getOrderHistory,
} = require("./inboundController");
const { createValidator, updateStatusValidator } = require("./inboundValidator");

const express = require("express");
const router = express.Router();

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "inbound_create";
    next();
  },
  authorize,
  createValidator,
  createController
);

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["inbound_read", "inbound_view_all"];
    next();
  },
  authorize,
  indexController
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "inbound_read";
    next();
  },
  authorize,
  readController
);

// router.patch(
//   "/:id",
//   authenticate,
//   (req, res, next) => {
//     req.apiRole = "inbound_update";
//     next();
//   },
//   authorize,
//   // updateValidator,
//   updateController
// );

router.patch(
  "/:id/status",
  authenticate,
  (req, res, next) => {
    req.apiRole = "inbound_update";
    next();
  },
  authorize,
  updateStatusValidator,
  updateStatus
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "inbound_delete";
    next();
  },
  authorize,
  indexDelete
);

router.post(
  "/:id/payment",
  authenticate,
  (req, res, next) => {
    req.apiRole = "";
    next();
  },
  authorize,
  createPaymentController
);

router.get("/export/excel",authenticate,(req,res,next)=>{
    req.apiRole = "";
    next();
},authorize,exportInboundController);

module.exports = router;
