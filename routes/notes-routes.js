const express = require("express");
const { check } = require("express-validator");

const notesControllers = require("../controllers/notes-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// router.get("/", bottlesControllers.getBottles);

router.get("/:nid", notesControllers.getNoteById);
router.get("/:wid/:vintage", notesControllers.getNotesByWineId);
router.patch("/:nid", notesControllers.updateNote);
router.delete("/:nid", notesControllers.deleteNote);
router.post("/", notesControllers.createNote);

// router.get("/wine/:wid", bottlesControllers.getBottlesByWineId);

// router.post("/", bottlesControllers.createBottle);

router.use(checkAuth);

module.exports = router;
