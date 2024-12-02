const express = require("express");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  createController,
  getList,
  getDetail,
  deleteContactWork,
  updateController,
} = require("./contactWorkController");
const {
  contactWorkValidator,
  updateContactWorkValidator,
} = require("./contactWorkValidator");

const router = new express.Router();
router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "contact_work_update";
    next();
  },
  authorize,
  getList
);

router.post("/create", contactWorkValidator, createController);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "contact_work_update";
    next();
  },
  authorize,
  getDetail
);

router.patch(
  "/:id",
  updateContactWorkValidator,
  authenticate,
  (req, res, next) => {
    req.apiRole = "contact_work_update";
    next();
  },
  authorize,
  updateController
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "contact_work_delete";
    next();
  },
  authorize,
  deleteContactWork
);

module.exports = router;
