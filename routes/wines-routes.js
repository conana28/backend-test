const express = require("express");
const { check } = require("express-validator");

const winesController = require("../controllers/wines-controllers");

const router = express.Router();

router.get("/", winesController.getWines);
router.get("/wine/:id", winesController.getWineById);
router.get("/winesearch/:search", winesController.getWinesBySearch);
router.post("/winesearch", winesController.searchWines);
router.post(
  "/wine",
  [
    check("producer").not().isEmpty(),
    check("wineName").not().isEmpty(),
    check("country").not().isEmpty(),
    check("region").not().isEmpty(),
  ],
  winesController.createWine
);
router.patch(
  "/wine/:id",
  [
    check("producer").not().isEmpty(),
    check("wineName").not().isEmpty(),
    check("country").not().isEmpty(),
    check("region").not().isEmpty(),
  ],
  winesController.updateWineById
);

// router.post(
//   "/signup",
//   fileUpload.single("image"),
//   [
//     check("name").not().isEmpty(),
//     check("email").normalizeEmail().isEmail(),
//     check("password").isLength({ min: 6 }),
//   ],
//   usersController.signup
// );

// router.post("/login", usersController.login);

module.exports = router;
