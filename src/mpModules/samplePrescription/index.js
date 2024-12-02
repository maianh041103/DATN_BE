const express = require("express");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  createController,
  readController,
  deleteController,
  updateController,
  updateStatusController,
} = require("./samplePrescriptionController");
const {
  samplePrescriptionValidator,
} = require("./samplePrescriptionValidator.js");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "sample_prescription_read";
    next();
  },
  authorize,
  indexController
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "sample_prescription_read";
    next();
  },
  authorize,
  readController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = "sample_prescription_create";
    next();
  },
  authorize,
  samplePrescriptionValidator,
  createController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "sample_prescription_update";
    next();
  },
  authorize,
  samplePrescriptionValidator,
  updateController
);

router.patch(
  "/:id/status",
  authenticate,
  (req, res, next) => {
    req.apiRole = "sample_prescription_update";
    next();
  },
  authorize,
  updateStatusController
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = "sample_prescription_delete";
    next();
  },
  authorize,
  deleteController
);

module.exports = router;
