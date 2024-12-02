const express = require("express");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  getList,
  getDetail,
  create,
  update,
  deleteRole,
} = require("./roleController");
const { createValidator } = require("./roleValidator");

const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = [
      "role_read",
      "user_read",
      "user_view_all",
      "user_create",
      "user_update",
    ];
    next();
  },
  authorize,
  getList
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "role_create";
    next();
  },
  authorize,
  createValidator,
  create
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "role_update";
    next();
  },
  authorize,
  getDetail
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "role_update";
    next();
  },
  authorize,
  update
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "role_delete";
    next();
  },
  authorize,
  deleteRole
);

module.exports = router;
