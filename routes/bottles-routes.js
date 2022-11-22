const express = require("express");
const { check } = require("express-validator");

const bottlesControllers = require("../controllers/bottles-controllers");
// const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", bottlesControllers.getBottles);

router.get("/:bid", bottlesControllers.getBottleById);

router.get("/wine/:wid", bottlesControllers.getBottlesByWineId);
router.get("/d/count", bottlesControllers.countBottles);
router.get("/d/countbycountry/:c", bottlesControllers.countByCountry);
router.get("/d/bottlesbycountry/:c", bottlesControllers.bottlesByCountry);

router.post("/bottlesearch", bottlesControllers.searchBottles);
router.post(
  "/bottlesearchbyvintage",
  bottlesControllers.searchBottlesByVintage
);

router.post("/", bottlesControllers.createBottle);

router.patch(
  "/:bid",
  [check("vintage").not().isEmpty(), check("rack").not().isEmpty()],
  bottlesControllers.updateBottle
);

router.delete("/:bid", bottlesControllers.consumeBottle);
router.delete("/d/:bid", bottlesControllers.deleteBottle);

// Conversion ONLY
router.get("/u/updateid", bottlesControllers.updateId);
router.get("/u/bottles", bottlesControllers.updateBottles);
router.get("/u/consume", bottlesControllers.consumeId);
router.get("/u/note", bottlesControllers.noteId);

// router.delete("/:pid", placesControllers.deletePlace);

router.use(checkAuth);

module.exports = router;
