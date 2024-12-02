const express = require("express");

const router = new express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    info: {
      service: {
        status: "up",
      },
    },
    error: {},
    details: {},
  });
});

module.exports = router;
