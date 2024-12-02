const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexBranchesController,
  readBranchController,
  createBranchController,
  updateBranchController,
  deleteBranchController,
} = require("./branchController");
const { createValidator } = require("./branchValidator");

const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["branch_read"];
    next();
  },
  authorize,
  indexBranchesController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "branch_create";
    next();
  },
  authorize,
  createValidator,
  createBranchController
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "branch_update";
    next();
  },
  authorize,
  readBranchController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["branch_read", "branch_update"];
    next();
  },
  authorize,
  createValidator,
  updateBranchController
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "branch_delete";
    next();
  },
  authorize,
  deleteBranchController
);

module.exports = router;
