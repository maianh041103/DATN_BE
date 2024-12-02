const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const tripController = require("./tripController");

router.post("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.createTrip);

router.get("/", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.getTrips);

router.get("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.getDetailTrip);

router.patch("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.updateTrip);

router.patch("/changeStatus/:tripCustomerId/:status", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.changeStatus);

router.get("/search/ref", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.searchMap);

router.get("/search/place", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.getPlace);

router.get("/search/reverse", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.reverse);

router.post("/geofencing", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.geofencing);

router.delete("/:id", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.deleteTrip);

router.post("/map-routing", authenticate, (req, res, next) => {
    req.apiRole = [];
    next();
}, authorize, tripController.mapRouting);

// router.patch("/change-current/:id", authenticate, (req, res, next) => {
//     req.apiRole = [];
//     next();
// }, authorize, tripController.changeCurrent);

module.exports = router;

