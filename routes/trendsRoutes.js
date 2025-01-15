const express = require("express");
const { scrapeTrendsController } = require("../controllers/trendsController"); // Use scrapeTrendsController if you want to use this method
const router = express.Router();

// Use /run-script route to trigger the scrapeTrendsController
router.get("/run-script", scrapeTrendsController);

module.exports = router;
