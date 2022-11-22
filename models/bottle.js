const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  vintage: { type: String, required: true },
  rack: { type: String, required: true },
  shelf: { type: String, required: false },
  country: { type: String, required: false },
  wineText: { type: String, required: false },
  wineId: { type: String, required: false },
  cost: { type: Number, required: false },
  wine: { type: mongoose.Types.ObjectId, required: true, ref: "Wine" },
});

module.exports = mongoose.model("Bottle", placeSchema);
