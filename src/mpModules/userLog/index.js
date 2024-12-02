const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const controller = require("./userLogController");

router.get("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, controller.getAll);

module.exports = router;