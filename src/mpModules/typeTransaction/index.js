const express = require("express");
const router = express.Router();
const typeTransactionController = require("./typeTransactionController");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");

router.post("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, typeTransactionController.createTypeTransaction);

router.get("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, typeTransactionController.getAllTypeTransaction);

router.get("/:ballotType", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, typeTransactionController.typeTransactionByBallotType);

router.get("/detail/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, typeTransactionController.getDetailTypeTransaction);

module.exports = router;