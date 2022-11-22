const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const Wine = require("../models/wine");

// Add a wine
const createWine = async (req, res, next) => {
  console.log("CREATE");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { producer, wineName, country, region, subRegion } = req.body;
  console.log(producer, wineName, country, region, subRegion);

  const createdWine = new Wine({
    producer,
    wineName,
    country,
    region,
    subRegion,
  });

  try {
    await createdWine.save();
  } catch (err) {
    const error = new HttpError(
      "E026w - Creating wine failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ wine: createdWine });
};

// Update a wine
const updateWineById = async (req, res, next) => {
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

  const { producer, wineName, country, region, subRegion } = req.body;
  const wid = req.params.id;

  console.log("wid = ", wid);

  let wine;
  try {
    // Get the current bottle details
    wine = await Wine.findById(wid);
  } catch (err) {
    const error = new HttpError(
      "E028w - Something went wrong, could not update wine.",
      500
    );
    return next(error);
  }
  // Update with the values to patch
  wine.producer = producer;
  wine.wineName = wineName;
  wine.country = country;
  wine.region = region;
  wine.subRegion = subRegion;

  try {
    await wine.save();
  } catch (err) {
    const error = new HttpError(
      "E028w - Something went wrong, could not update/save wine.",
      500
    );
    return next(error);
  }

  res.status(200).json({ wine: wine.toObject({ getters: true }) });
};

const searchWines = async (req, res) => {
  const s = req.body;
  console.log("Search wine post ", s);
  // construct a query for AND from data passed in object
  let q = {};
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      // console.log(`${key}: ${req.body[key]}`);
      q[key] = {
        $regex: req.body[key] ? req.body[key] : "", // in case pass null
        $options: "i",
      };
    }
  }
  console.log("Query", q);

  try {
    // let query = Wine.find().where(q).sort({ producer: 1 });

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * pageSize;
    const total = await Wine.countDocuments().where(q);

    const pages = Math.ceil(total / pageSize);

    // query = query.skip(skip).limit(pageSize);

    let query = Wine.find()
      .where(q)
      .sort({ producer: 1 })
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
      console.log(result.length);
      res.status(200).json({
        status: "success",
        count: result.length,
        page,
        pages,
        data: result,
      });
    } else {
      console.log(result.length);
      res.status(200).json({
        status: "not found",
        count: result.length,
        page,
        pages,
        data: [{ _id: "11", producer: "No wines match criteria" }],
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

// Get All wines
const getWines = async (req, res, next) => {
  console.log("Get All Wines");
  let wines;
  try {
    wines = await Wine.find({});
  } catch (err) {
    const error = new HttpError(
      "E010 - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ wines: wines.map((user) => user.toObject({ getters: true })) });
};

// Get Wine by Id
const getWineById = async (req, res, next) => {
  console.log("Get Wine by Id");
  const wId = req.params.id;
  console.log(wId);
  let wine;
  try {
    wine = await Wine.findById(wId);
    console.log(wine);
  } catch (err) {
    const error = new HttpError(
      "E011 - Fetching wine failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ wine: wine.toObject({ getters: true }) });
};

//Get Wines matching search
const getWinesBySearch = async (req, res, next) => {
  const search = req.params.search;
  let wines;
  try {
    wines = await Wine.find({ wineName: { $regex: search, $options: "i" } });
    console.log(wines);
  } catch (err) {
    const error = new HttpError(
      "E012 - Fetching wines failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ wines: wines.map((user) => user.toObject({ getters: true })) });
};

exports.createWine = createWine;
exports.updateWineById = updateWineById;
exports.searchWines = searchWines;
exports.getWines = getWines;
exports.getWineById = getWineById;
exports.getWinesBySearch = getWinesBySearch;
