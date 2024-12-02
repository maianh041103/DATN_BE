const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  readController,
  createController,
  updateController,
  updateStatus, indexDelete, indexDeleteController,
    exportPurchaseReturnController,
    exportPurchaseReturnDetailController
} = require("./purchaseReturnController");
const { createValidator, updateStatusValidator } = require("./purchaseReturnValidator");

const express = require("express");
const {deleteProducts} = require("../product/productController");
const {exportDoctorController} = require("../doctor/doctorController");
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
    indexDeleteController
);

router.get("/export/excel", authenticate, (req, res, next) => {
    req.apiRole = "";
    next();
},
    authorize,
    exportPurchaseReturnController
);

router.get("/export/excel-detail", authenticate, (req, res, next) => {
        req.apiRole = "";
        next();
    },
    authorize,
    exportPurchaseReturnDetailController
);

module.exports = router;
