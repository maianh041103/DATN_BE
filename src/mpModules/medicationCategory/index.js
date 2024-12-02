const express = require("express");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexController,
  createController,
  deleteController,
  updateController,
  readByCodeController,
} = require("./medicationCategoryController");
const {
  medicationCategoryValidator,
  medicationCategoryUpdateValidator
} = require("./medicationCategoryValidator.js");

const router = new express.Router();

router.get("/", authenticate, indexController);
router.get("/code/:code", authenticate, readByCodeController);
router.post(
  "/create",
  authenticate,
  medicationCategoryValidator,
  createController
);
router.put(
  "/update/:id",
  authenticate,
  medicationCategoryUpdateValidator,
  updateController
);
router.delete("/delete/:id", authenticate, deleteController);

module.exports = router;
