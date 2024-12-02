const express = require('express');
const router = express.Router();
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const customerNoteController = require("./customerNoteController");

router.post("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, customerNoteController.create);

router.get("/:customerId", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, customerNoteController.getAllByCustomer);

router.patch("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, customerNoteController.update);

router.delete("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, customerNoteController.delete);

module.exports = router;