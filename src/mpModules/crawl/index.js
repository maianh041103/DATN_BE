const express = require('express');
const {authenticate} = require("../../middlewares/auth");
const {authorize} = require("../../middlewares/authorize");
const crawlController = require("./crawlController");
const router = express.Router();

router.post("/medicine_market", crawlController.pullFromMedicineMarket);

router.post("/wholesale_medicine", crawlController.pullFromWholesaleMedicine);

module.exports = router;