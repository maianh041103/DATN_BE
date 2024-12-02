const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  indexMasterSaleProductController,
  indexMasterInboundProductController,
  readController,
  createController,
  updateController,
  deleteController,
  updateStatus,
  deleteProducts,
  indexPriceSettingController,
  updatePriceSettingController,
  updateEndDateProducts,
  createUploadController,
    exportProductController,
    exportProductExampleController,
    createUploadKiotvietController
} = require("./productController");
const {
  createValidator,
  updateStatusValidator,
  updateEndDateValidator,
  updateProductPriceSettingValidator,
} = require("./productValidator");
const express = require("express");
const { getNextValue } = require("./productCodeService");
const { indexInventoryController } = require("./productInventoryController");

const router = express.Router();

router.get(
  "/inbound/master",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "product_read",
      "order_create",
      "order_update",
      "sales_report_read",
      "discount_read",
      "promotion_read",
    ];
    next();
  },
  authorize,
  indexMasterInboundProductController
);

router.get(
  "/sale/master",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "product_read",
      "order_create",
      "order_update",
      "sales_report_read",
      "discount_read",
      "promotion_read",
    ];
    next();
  },
  authorize,
  indexMasterSaleProductController
);

router.get(
  "/warehouse/remain",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "product_read"
    ];
    next();
  },
  authorize,
  indexMasterSaleProductController
);

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "product_read",
      "order_create",
      "order_update",
      "sales_report_read",
      "discount_read",
      "promotion_read",
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
    req.apiRole = "product_create";
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
    req.apiRole = "product_update";
    next();
  },
  authorize,
  readController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_update";
    next();
  },
  authorize,
  createValidator,
  updateController
);

router.patch(
  "/:id/status",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_update";
    next();
  },
  authorize,
  updateStatusValidator,
  updateStatus
);

router.get(
  "/:id/inventory",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_read";
    next();
  },
  authorize,
  indexInventoryController
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_delete";
    next();
  },
  authorize,
  deleteController
);

router.delete(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_delete";
    next();
  },
  authorize,
  deleteProducts
);

// Update endDate many products in Ids
router.patch(
  "/endDate",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_update";
    next();
  },
  authorize,
  updateEndDateValidator,
  updateEndDateProducts
);

router.get(
  "/price/setting",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "product_read",
      "order_create",
      "order_update",
      "sales_report_read",
      "discount_read",
      "promotion_read",
    ];
    next();
  },
  authorize,
  indexPriceSettingController
);

router.patch(
  "/price/setting/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_update";
    next();
  },
  authorize,
  updateProductPriceSettingValidator,
  updatePriceSettingController
);

router.post(
  "/upload",
  authenticate,
  (req, res, next) => {
    req.apiRole = "product_create";
    next();
  },
  authorize,
  createUploadController
);

router.get(
    "/export/excel",authenticate,
    (req,res,next)=>{
        req.apiRole = "product_read";
        next();
    },
    authorize,
    exportProductController
);

router.get("/export/example",authenticate,
    (req,res,next)=>{
    req.apiRole = "product_read";
    next();
    },
    authorize,
    exportProductExampleController
);

router.post(
    "/upload/kiotviet",
    authenticate,
    (req, res, next) => {
        req.apiRole = "product_create";
        next();
    },
    authorize,
    createUploadKiotvietController
);

module.exports = router;
