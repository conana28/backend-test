const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  producer: { type: String, required: true },
  wineName: { type: String, required: true },
  country: { type: String, required: true },
  region: { type: String, required: true },
  subRegion: { type: String, required: false },
  bottles: [{ type: mongoose.Types.ObjectId, required: true, ref: "Bottle" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Wine", userSchema);
