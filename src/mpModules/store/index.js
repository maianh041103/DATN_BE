const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const {
  indexStoresController,
  readStoreController,
  createStoreController,
  updateStoreController,
  // deleteStoreController,
  ListStoresController
} = require("./storeController");
const { createValidator } = require("./storeValidator");
const express = require("express");
const router = new express.Router();

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["store_read"];
    next();
  },
  authorize,
  indexStoresController
);

router.post("/", createValidator, createStoreController);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["store_read", "store_update"];
    next();
  },
  authorize,
  readStoreController
);

router.patch(
  "/:id",
  authenticate,
  (req, res, next) => {
    req.apiRole = ["store_update"];
    next();
  },
  authorize,
  createValidator,
  updateStoreController
);

// router.delete(
//   "/:id",
//   authenticate,
//   (req, res, next) => {
//     req.apiRole = "store_delete";
//     next();
//   },
//   authorize,
//   deleteStoreController
// );
router.get(
  "/list/getStore",
  
  ListStoresController
);
module.exports = router;
