const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const consumeBottleSchema = new Schema({
  vintage: { type: String, required: true },
  // vintage: { type: Number, required: true },
  rack: { type: String, required: true },
  shelf: { type: String, required: false },
  country: { type: String, required: false },
  wineText: { type: String, required: false },
  wineId: { type: String, required: false },
  cost: { type: Number, required: false },
  wine: { type: mongoose.Types.ObjectId, required: true, ref: "Wine" },
  consume: { type: Date, required: true },
});

module.exports = mongoose.model("ConsumeBottle", consumeBottleSchema);
