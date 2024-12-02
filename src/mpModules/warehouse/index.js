const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");

const express = require("express");
const {getWarehouseCard} = require("./warehouseController");
const router = new express.Router();

router.get(
    "/card",
    authenticate,
    (req, res, next) => {
    req.apiRole = ["product_read"];
    next();
    },
    authorize,
    getWarehouseCard
);
router.get(
    "/inventory",
    authenticate,
    (req, res, next) => {
    req.apiRole = "product_read";
    next();
    },
    authorize, getWarehouseCard
);

module.exports = router;
