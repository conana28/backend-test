const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const ConsumeBottle = require("../models/consume-bottle");

// Search consume by passed in Object
const searchConsumed = async (req, res) => {
  const s = req.body;
  console.log("Search consume ", s);
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
    const total = await ConsumeBottle.countDocuments().where(q);
    const pages = Math.ceil(total / pageSize);

    let query = ConsumeBottle.find()
      .where(q)
      .sort({ consume: -1 })
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

exports.searchConsumed = searchConsumed;
