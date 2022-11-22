const express = require("express");
const { check } = require("express-validator");

const consumedControllers = require("../controllers/consumed-controllers");
// const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// router.get("/", bottlesControllers.getBottles);

router.post("/consumedsearch", consumedControllers.searchConsumed);

router.use(checkAuth);

module.exports = router;
