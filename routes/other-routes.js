const express = require("express");
const { check } = require("express-validator");

const otherControllers = require("../controllers/other-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/c/", otherControllers.getCountries);
router.get("/r/:country", otherControllers.getRegions);
router.get("/sr/:region", otherControllers.getSubRegions);

// router.get("/:nid", notesControllers.getNoteById);
// router.get("/:wid/:vintage", notesControllers.getNotesByWineId);
// router.patch("/:nid", notesControllers.updateNote);
// router.delete("/:nid", notesControllers.deleteNote);
// router.post("/", notesControllers.createNote);

// router.get("/wine/:wid", bottlesControllers.getBottlesByWineId);

// router.post("/", bottlesControllers.createBottle);

router.use(checkAuth);

module.exports = router;
