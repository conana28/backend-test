const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const countrySchema = new Schema({
  type: { type: String, required: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
});

module.exports = mongoose.model("CountryData", countrySchema);
