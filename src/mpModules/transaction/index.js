const express = require("express");
const router = express.Router();
const transactionController = require("./transactionController");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");

router.post("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, transactionController.createTransaction);

router.get("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, transactionController.getAllTransaction);

router.get("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, transactionController.getDetailTransaction);

router.patch("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, transactionController.updateTransaction);

router.delete("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, transactionController.deleteTransaction);

module.exports = router;
