const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexUsersController,
  createController,
  updateController,
  deleteUser,
  readController,
  resetPassword,
  updateStatus,
} = require("./userController");
const {
  createValidator,
  updateValidator,
  resetPasswordValidator,
  updateStatusValidator,
} = require("./userValidator");

const express = require("express");

const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "user_read",
      "dashboard_read",
      "user_view_all",
      "search_all_read",
      "order_history_read",
      "sales_report_read",
    ];
    next();
  },
  authorize,
  indexUsersController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "user_create";
    next();
  },
  authorize,
  createValidator,
  createController
);

router.get(
  "/:id",
  authenticate,
//   (req, res, next) => { req.apiRole = ['user_read', ]; next(); },
//   authorize,
  readController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["user_update"];
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
    req.apiRole = ["user_delete"];
    next();
  },
  authorize,
  deleteUser
);

router.post(
  "/reset-password",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["user_update"];
    next();
  },
  authorize,
  resetPasswordValidator,
  resetPassword
);

router.patch(
  "/:id/status",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["user_update"];
    next();
  },
  authorize,
  updateStatusValidator,
  updateStatus
);

module.exports = router;
