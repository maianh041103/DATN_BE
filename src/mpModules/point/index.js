const express = require('express');
const router = express.Router();
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const pointController = require("./pointController");

router.post("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, pointController.create);

router.get("/:type", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, pointController.detail);

router.patch("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, pointController.changeStatus);

router.delete("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, pointController.delete);

router.get("/check/status", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, pointController.checkStatus);

router.patch("/:customerId", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, pointController.changePointCustomer);

module.exports = router;