const express = require("express");
const router = express.Router();
const controllers = require("./adminController");

router.patch("/", controllers.createAgencyController);

module.exports = router;