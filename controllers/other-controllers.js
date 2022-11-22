const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// const HttpError = require("../models/http-error");
// const { selectFields } = require("express-validator/src/select-fields");
const CountryData = require("../models/countryData");

// Get all countries
const getCountries = async (req, res, next) => {
  // const wid = req.params.wid;
  const c = await CountryData.find({ type: "c" }, { value: 1, label: 1 });

  res.json({
    countries: c.map((cc) => cc.toObject()),
  });
};

// Get regions by country
const getRegions = async (req, res, next) => {
  const country = req.params.country;
  const r = await CountryData.find(
    { type: "r", country: country },
    { value: 1, label: 1 }
  );
  // console.log(r);
  res.json({
    regions: r.map((rr) => rr.toObject()),
  });
};

// Get sub regions by region
const getSubRegions = async (req, res, next) => {
  const region = req.params.region;
  const s = await CountryData.find(
    { type: "sr", region: region },
    { value: 1, label: 1 }
  );

  res.json({
    subRegions: s.map((sr) => sr.toObject()),
  });
};

exports.getCountries = getCountries;
exports.getRegions = getRegions;
exports.getSubRegions = getSubRegions;
