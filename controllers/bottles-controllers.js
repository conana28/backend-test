const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Bottle = require("../models/bottle");
const ConsumeBottle = require("../models/consume-bottle");
const Note = require("../models/note");
const Wine = require("../models/wine");
const { selectFields } = require("express-validator/src/select-fields");

// Test API - Get 5 bottles

// Get All bottles
const getBottles = async (req, res, next) => {
  // console.log("Get All Bottles");
  let bottles;
  try {
    bottles = await Bottle.find({}).limit(5);
  } catch (err) {
    const error = new HttpError(
      "E010 - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    bottles1x: bottles.map((user) => user.toObject({ getters: false })),
  });
};

// Get a bottle by it's id
const getBottleById = async (req, res, next) => {
  const bId = req.params.bid;
  let bottle;
  try {
    bottle = await Bottle.findById(bId);
  } catch (err) {
    const error = new HttpError(
      `E020 - Something went wrong, could not find the bottle with id=${bId}`,
      500
    );
    return next(error);
  }

  if (!bottle) {
    const error = new HttpError(
      `E021 - Could not find place for the provided id ${bId}.`,
      404
    );
    return next(error);
  }

  res.json({ bottle: bottle.toObject({ getters: true }) });
};

// Get all bottles for a wine (in the bottles array of wine collection)
const getBottlesByWineId = async (req, res, next) => {
  const wId = req.params.wid;
  let wineWithBottles;
  try {
    wineWithBottles = await Wine.findById(wId).populate("bottles");
    // console.log("WWB ", wineWithBottles);
  } catch (err) {
    const error = new HttpError(
      "E022 - Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!wineWithBottles || wineWithBottles.bottles.length === 0) {
    return next(
      new HttpError(
        `E023 - Could not find places for the provided wine id - ${wId}`,
        404
      )
    );
  }

  res.json({
    bottles: wineWithBottles.bottles.map((bottle) =>
      bottle.toObject({ getters: true })
    ),
  });
};

// Add a bottle (Need to add the wine id - currently defaults)
const createBottle = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { vintage, rack, shelf, cost, country, wineText, wineId, wId } =
    req.body;

  const createdBottle = new Bottle({
    vintage,
    rack,
    shelf,
    cost,
    country,
    wineText,
    wineId,
    wine: wId,
  });

  let wine;
  try {
    wine = await Wine.findById(wId);
  } catch (err) {
    const error = new HttpError(
      "E024 - Finding wine failed, please try again.",
      500
    );
    return next(error);
  }

  if (!wine) {
    const error = new HttpError(
      "E025 - Could not find wine for provided id.",
      404
    );
    return next(error);
  }

  // console.log(wine);

  try {
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // await createdBottle.save({ session: sess });
    await createdBottle.save();
    wine.bottles.push(createdBottle);
    await wine.save();
    // await wine.save({ session: sess });
    // await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "E026 - Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ bottle: createdBottle });
};

// Update a bottle
const updateBottle = async (req, res, next) => {
  // Route will validate vintage & rack is not empty
  console.log("PATCH");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "E027 - Invalid inputs passed, please check your bottle data.",
        422
      )
    );
  }

  const { vintage, rack, shelf, cost } = req.body;
  const bId = req.params.bid;

  // console.log("bid = ", bId);
  // console.log("vintage = ", vintage, rack, shelf, cost);

  let bottle;
  try {
    // Get the current bottle details
    bottle = await Bottle.findById(bId);
  } catch (err) {
    const error = new HttpError(
      "E028 - Something went wrong, could not update bottle.",
      500
    );
    return next(error);
  }

  // if (place.creator.toString() !== req.userData.userId) {
  //   const error = new HttpError("You are not allowed to edit this place.", 401);
  //   return next(error);
  // }

  // Update with the values to patch
  bottle.vintage = vintage;
  bottle.rack = rack;
  // if (shelf) {
  bottle.shelf = shelf;
  // }
  // if (cost) {
  bottle.cost = cost;
  // }

  try {
    await bottle.save();
  } catch (err) {
    const error = new HttpError(
      "E028 - Something went wrong, could not update/save bottle.",
      500
    );
    return next(error);
  }

  res.status(200).json({ bottle: bottle.toObject({ getters: true }) });
};

// Consume a bottle
// ----------------
const consumeBottle = async (req, res, next) => {
  console.log("Consume");
  const bId = req.params.bid;
  const { consume } = req.body;
  // console.log("Consume ", consume);

  let bottle;
  try {
    bottle = await Bottle.findById(bId).populate("wine");
  } catch (err) {
    const error = new HttpError(
      "E029 - Something went wrong, could not delete bottle.",
      500
    );
    return next(error);
  }

  if (!bottle) {
    const error = new HttpError(
      "E029a - Could not find bottle for this id.",
      404
    );
    return next(error);
  }

  const consumedBottle = new ConsumeBottle({
    vintage: bottle.vintage,
    rack: bottle.rack,
    shelf: bottle.shelf,
    cost: bottle.cost,
    wineText: bottle.wineText,
    wineId: bottle.wineId,
    wine: bottle.wine,
    // consume: "2002-12-19",
    consume: consume,
  });

  // console.log("Consumed Bottle ", consumedBottle);

  try {
    // Delete Bottle from Bottles
    await bottle.remove();
    bottle.wine.bottles.pull(bottle);
    // Update Wine
    await bottle.wine.save();
    // Add Bottle to consumed bottle
    await consumedBottle.save();

    // Can't use sessions locally enable on Atlas
    // ------------------------------------------
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // Delete Bottle
    // await bottle.remove({ session: sess });
    // await bottle.remove();
    // bottle.wine.bottles.pull(bottle);
    // Update Wine
    // await bottle.wine.save({ session: sess });
    // Add a consumed bottle
    // await consumedBottle.save({ session: sess });
    // await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      `E029b - -Something went wrong, could not consume bottle. ${Error}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Consume bottle." });
};

// Delete a Bottle by Id and update Wine bottles array
const deleteBottle = async (req, res, next) => {
  console.log("Delete");
  const bid = req.params.bid;
  let bottle;
  try {
    bottle = await Bottle.findById(bid).populate("wine");
  } catch (err) {
    const error = new HttpError(
      "E029 - Something went wrong, could not delete bottle.",
      500
    );
    return next(error);
  }

  // Delete Bottle from Bottles array

  await bottle.remove();
  bottle.wine.bottles.pull(bottle);
  // Update Wine
  await bottle.wine.save();
  // Delete bottle from bottles collection
  await Bottle.deleteOne({ _id: bid });

  res.status(204).json("Deleted");
};

// Search bottle by passed in Object
const searchBottles = async (req, res) => {
  const s = req.body;
  console.log("Search bottle post ", s);
  // construct a query for AND from data passed in object
  let q = {};
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      q[key] = { $regex: req.body[key] ? req.body[key] : "", $options: "i" };
    }
  }
  // console.log("Query", q);
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * pageSize;
    const total = await Bottle.countDocuments().where(q);
    const pages = Math.ceil(total / pageSize);

    let query = Bottle.find()
      .where(q)
      .sort({ wineText: 1, vintage: 1 })
      .skip(skip)
      .limit(pageSize);

    // if (page > pages) {
    //   return res.status(404).json({
    //     status: "fail",
    //     message: "No page found",
    //   });
    // }

    const result = await query;
    // console.log("Result", result);

    if (result.length > 0) {
      // console.log(result.length);
      res.status(200).json({
        status: "success",
        count: result.length,
        page,
        pages,
        data: result,
      });
    } else {
      // console.log(result.length);
      res.status(200).json({
        status: "not found",
        count: result.length,
        page,
        pages,
        data: [{ _id: "11", wineText: "No bottles match criteria" }],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// Search bottle by passed in Object
const searchBottlesByVintage = async (req, res) => {
  const s = req.body;
  // console.log("Search bottle post ", s);
  try {
    let query = Bottle.find().where(s).sort({ wineText: 1, vintage: 1 });

    const result = await query;
    // console.log("Result", result);

    if (result.length > 0) {
      // console.log(result.length);
      res.status(200).json({
        status: "success",
        count: result.length,
        data: result,
      });
    } else {
      // console.log(result.length);
      res.status(200).json({
        status: "not found",
        count: result.length,
        page,
        pages,
        data: [{ _id: "11", wineText: "No bottles match criteria" }],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

// -------------------------
// Dashboard functions
// --------------------------

// Bottles by Country
const bottlesByCountry = async (req, res, next) => {
  const country = req.params.c;
  // console.log("Get Bottles for Country", country);
  let bottles;
  try {
    if (country === "All" || country === "Other") {
      bottles = await Bottle.find({});
    } else {
      bottles = await Bottle.find({ country: country });
    }
  } catch (err) {
    const error = new HttpError(
      "E010 - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  // get vintages and bottle numbers
  let list = bottles;
  let x9 = [];

  if (country === "All") {
    x9 = [...list];
  } else if (country !== "Other") {
    x9 = list.filter((obj) => obj.country === country); // new bottle array for a country
  } else {
    x9 = list.filter(
      (obj) =>
        obj.country !== "New Zealand" &&
        obj.country !== "France" &&
        obj.country !== "Italy" &&
        obj.country !== "Australia" &&
        obj.country !== "Spain" &&
        obj.country !== "Germany" &&
        obj.country !== "Portugal"
    );
  }

  const x0 = Array.from(x9, (x) => x.vintage); // create a new array of only the vintages
  const x00 = [...new Set(x0)].sort(); // Filters out duplicates and sorts array
  const bv = []; // Bottle vintage array for graph
  let pre2k = 0; // Pre2k total working variable
  x00.forEach((item) => {
    // For each vintage count how many bottles
    const x = x9.filter((obj) => obj.vintage === item).length;
    if (item < 2000) {
      pre2k += x;
    } else {
      bv.push(x);
    }
  });

  // x axis for pre2K
  const x8 = x00.filter((obj) => obj > 1999); // Remove any pre2K vintages from x axis
  if (pre2k > 0) {
    x8.unshift("pre2k"); // prepend Pre2k label
    bv.unshift(pre2k); // prepend Pre2k totals
  }
  // x axis for n/v
  const index = x8.indexOf("9999");
  if (index !== -1) {
    x8[index] = "n/v";
  }

  // Send data back
  res.json({
    xaxis: x8,
    yaxis: bv,
  });
};
// Count bottles by Country
const countByCountry = async (req, res, next) => {
  const country = req.params.c;
  let countriesForGraph = [];
  if (country === "All") {
    countriesForGraph = [
      "New Zealand",
      "France",
      "Italy",
      "Australia",
      "Spain",
      "Germany",
      "Portugal",
    ];
  } else {
    countriesForGraph = [country];
  }

  let bbc = [];
  let n = 0;
  for (i = 0; i < countriesForGraph.length; i++) {
    bbc[i] = await Bottle.countDocuments({ country: countriesForGraph[i] });
    n = n + bbc[i];
  }
  bbc.push(601 - n);
  res.json({
    n,
    bbc,
  });
};

// Count All bottles
const countBottles = async (req, res, next) => {
  let bottlesCount;
  let diffBottlesCount;
  let consumeCount;
  let wineCount;
  try {
    bottlesCount = await Bottle.countDocuments({});
  } catch (err) {
    const error = new HttpError(
      "E010X - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  try {
    diffBottlesCount = await Bottle.distinct("wine");
  } catch (err) {
    const error = new HttpError(
      "E010X - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }

  try {
    consumeCount = await ConsumeBottle.countDocuments({});
  } catch (err) {
    const error = new HttpError(
      "E010X - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }

  try {
    wineCount = await Wine.countDocuments({});
  } catch (err) {
    const error = new HttpError(
      "E010X - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    bottlesCount,
    diffBottlesCount: diffBottlesCount.length,
    consumeCount,
    wineCount,
  });
};

// -------------------------
// Conversion ONLY functions
// --------------------------
// Update bottle with wine Objectid
const updateId = async (req, res, next) => {
  // console.log("Update Bottle Ids");
  let bottles;
  try {
    bottles = await Bottle.find({});
  } catch (err) {
    const error = new HttpError(
      "E010 - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  // console.log(bottles);

  bottles.map(async (bottle) => {
    // Get Wine oid
    // console.log("Bottle WineId = ", bottle.wineId);
    const w = await Wine.findOne({ wineId: bottle.wineId });
    // console.log(w._id);
    // Update the bottle wine
    bottle.wine = w._id;
    await bottle.save();
  });
  //remove the wineId field
  // await Bottle.updateMany({}, { $unset: { wineId: 1 } });

  res.send("All done");
};

// Update consume with wine Objectid
const consumeId = async (req, res, next) => {
  // console.log("Update Consume Bottle Ids");
  let c;
  try {
    c = await ConsumeBottle.find({});
  } catch (err) {
    const error = new HttpError(
      "E010 - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  // console.log("Consume bottle ", c[0]);

  c.map(async (consume) => {
    // Get Wine oid
    // console.log("Consume WineId = ", consume.wineId);
    const w = await Wine.findOne({ wineId: consume.wineId });
    // console.log(w._id);
    // Update the bottle wine
    consume.wine = w._id;
    await consume.save();
  });
  //remove the wineId field
  // await Bottle.updateMany({}, { $unset: { wineId: 1 } });

  res.send("Conusme All done");
};

// Update note with wine Objectid
const noteId = async (req, res, next) => {
  console.log("Update Notes with wineIds");
  let n;
  try {
    n = await Note.find({}); // get all the notes into an array
  } catch (err) {
    const error = new HttpError(
      "E010N - Fetching notes failed, please try again later.",
      500
    );
    return next(error);
  }
  console.log("Note ", n[0]);

  n.map(async (note) => {
    // Get Wine Note WineId = ", note.wineId);
    const w = await Wine.findOne({ wineId: note.wineId }); // Find thr wine with the wineId
    // console.log("Wine id ", w._id);
    // Update the bottle wine
    note.wine = w._id;
    await note.save();
  });

  res.send("Notes All done");
};

// Update wines with a bottles array
const updateBottles = async (req, res, next) => {
  let bottles;
  bottles = await Bottle.find({}); // Get all bottles
  // Update the Wine bottles array
  bottles.map(async (bottle) => {
    let w = await Wine.findById(bottle.wine);

    if (!w) {
      const error = new HttpError(
        "E025 - Could not find wine for provided id.",
        404
      );
      return next(error);
    }

    w.bottles.push(bottle._id);
    await w.save();

    // console.log(w.wineId, w.wineName);
  });
};

exports.getBottles = getBottles;
exports.getBottleById = getBottleById;
exports.getBottlesByWineId = getBottlesByWineId;
exports.createBottle = createBottle;
exports.updateBottle = updateBottle;
exports.consumeBottle = consumeBottle;
exports.deleteBottle = deleteBottle;
exports.searchBottles = searchBottles;
exports.searchBottlesByVintage = searchBottlesByVintage;
// Conversion only
exports.updateId = updateId;
exports.consumeId = consumeId;
exports.noteId = noteId;
exports.updateBottles = updateBottles;
// Dashboard
exports.countBottles = countBottles;
exports.countByCountry = countByCountry;
exports.bottlesByCountry = bottlesByCountry;
