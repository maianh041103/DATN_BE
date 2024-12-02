const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const inventoryCheckingController = require("./inventoryCheckingController");

router.post("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, inventoryCheckingController.create);

router.get("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, inventoryCheckingController.getAll);

router.get("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, inventoryCheckingController.detail);

router.delete("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, inventoryCheckingController.delete);

module.exports = router;