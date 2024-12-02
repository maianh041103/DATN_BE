const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  readController,
  createController,
  updateController,
  deleteController,
} = require("./configurationController");
const { createValidator } = require("./configurationValidator");

const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
      req.apiRole = [
      ]; next();
  }, 
  authorize,
  indexController
);

router.post(
  "/",
  authenticate,
  (req, res, next) => { req.apiRole = 'configuration_create'; next(); },
  authorize,
  createValidator,
  createController
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => { req.apiRole = 'configuration_update'; next(); },
  authorize,
  readController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => { req.apiRole = 'configuration_update'; next(); }, authorize,
  createValidator,
  updateController
);

router.delete(
  "/:id",
  authenticate,
  (req, res, next) => { req.apiRole = 'configuration_delete'; next(); },
  authorize,
  deleteController
);

module.exports = router;
