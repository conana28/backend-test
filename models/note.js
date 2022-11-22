const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  vintage: { type: String, required: true },
  author: { type: String, required: true },
  rating: { type: String, required: true },
  noteText: { type: String, required: false },
  drinkFrom: { type: String, required: false },
  drinkTo: { type: String, required: false },
  wineText: { type: String, required: false },
  wineId: { type: String, required: false },
  wine: { type: mongoose.Types.ObjectId, required: true, ref: "Wine" },
});

module.exports = mongoose.model("Note", placeSchema);
