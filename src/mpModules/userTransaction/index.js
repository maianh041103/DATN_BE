const express = require("express");
const router = express.Router();
const userTransaction = require("./userTransactionController");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");

router.post("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, userTransaction.createUserTransaction);

router.get("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, userTransaction.getAll);

router.get("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, userTransaction.getDetail);

module.exports = router;