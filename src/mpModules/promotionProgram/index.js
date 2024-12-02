import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import {
  getList,
  getDetail,
  create,
  update,
  deleteController,
} from "./promotionProgramController";
import { createValidator } from "./promotionProgramValidator";

const express = require("express");

const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["promotion_read"];
    next();
  },
  authorize,
  getList
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "promotion_create";
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
    req.apiRole = "promotion_update";
    next();
  },
  authorize,
  getDetail
);

router.put(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "promotion_update";
    next();
  },
  authorize,
  createValidator,
  update
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "promotion_delete";
    next();
  },
  authorize,
  deleteController
);

module.exports = router;
