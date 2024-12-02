const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  updateController,
  createController,
  indexCustomersController,
  deleteController,
  resetPassword,
  getCustomerListByGroup,
  readController,
  updateStatus, getTotalDebtController, getDefaultCustomer,
  readPaymentCustomerController, historyPoint,
  historyVisited,
  createCustomerByUploadController,
    exportCustomerController,
    exportCustomerExampleController,
    createCustomerByUploadKiotvietController,
    deleteListCustomerController
} = require("./customerController");
const {
  updateValidator,
  createValidator,
  resetPasswordValidator,
} = require("./customerValidator");
const express = require("express");
const router = express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "customer_read",
      "dashboard_read",
      "customer_view_all",
      "order_history_read",
      "sales_report_read",
      "product_link_customer_user_read",
    ];
    next();
  },
  authorize,
  indexCustomersController
);

router.get(
  "/store/default",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "customer_read",
      "dashboard_read",
      "customer_view_all",
      "order_history_read",
      "sales_report_read",
      "product_link_customer_user_read",
    ];
    next();
  },
  authorize,
  getDefaultCustomer
);

router.get(
  "/:id/total-debt",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "customer_read",
      "dashboard_read",
      "customer_view_all",
      "order_history_read",
      "sales_report_read",
      "product_link_customer_user_read",
    ];
    next();
  },
  authorize,
  getTotalDebtController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "customer_create";
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
    req.apiRole = "customer_read";
    next();
  },
  authorize,
  readController
);

router.put(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "customer_update";
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
    req.apiRole = ["customer_delete"];
    next();
  },
  authorize,
  deleteController
);

router.post(
  "/reset-password",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["customer_update"];
    next();
  },
  authorize,
  resetPasswordValidator,
  resetPassword
);

router.get(
  "/group",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "user_read",
      "user_view_all",
      "order_history_read",
      "discount_read",
      "promotion_read",
      "product_link_customer_user_read",
    ];
    next();
  },
  authorize,
  getCustomerListByGroup
);

router.get(
  "/:id/payment",
  authenticate,
  (req, res, next) => {
    req.apiRole = "order_read";
    next();
  },
  authorize,
  readPaymentCustomerController
)

// manager
router.patch(
  "/:id/status",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["customer_update"];
    next();
  },
  authorize,
  updateStatus
);

router.get("/:customerId/history-point", authenticate,
  (req, res, next) => {
    req.apiRole = "order_read";
    next();
  }, authorize, historyPoint)

router.get("/:id/history-visited", authenticate,
  (req, res, next) => {
    req.apiRole = "order_read";
    next();
  }, authorize, historyVisited);

router.post(
  '/upload',
  authenticate,
  (req, res, next) => {
    req.apiRole = ['customer_update', 'customer_read', 'customer_create']
    next()
  },
  authorize,
  createCustomerByUploadController
);

router.get("/export/excel", authenticate,(req, res, next) => {
    req.apiRole = ["customer_read"];
    next();
},authorize,exportCustomerController);

router.get("/export/example",authenticate,(req,res,next)=>{
    req.apiRole = ["customer_read"];
    next();
},authorize,exportCustomerExampleController);

router.post(
    '/upload/kiotviet',
    authenticate,
    (req, res, next) => {
        req.apiRole = ['customer_update', 'customer_read', 'customer_create']
        next()
    },
    authorize,
    createCustomerByUploadKiotvietController
);

router.delete(
    "/",
    authenticate,
    (req, res, next) => {
        req.apiRole = ["customer_delete"];
        next();
    },
    authorize,
    deleteListCustomerController
);

module.exports = router;
