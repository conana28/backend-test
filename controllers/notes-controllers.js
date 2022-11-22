const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
// const Bottle = require("../models/bottle");
// const ConsumeBottle = require("../models/consume-bottle");
const Note = require("../models/note");
// const Wine = require("../models/wine");
const { selectFields } = require("express-validator/src/select-fields");

// Get all notes for a wine.  Search the wine field in the note
const getNotesByWineId = async (req, res, next) => {
  // const wid = req.params.wid;
  const { wid, vintage } = req.params;
  console.log("*** Get Notes by Wine id", wid, vintage);
  let n;
  if (vintage === "all") {
    n = await Note.find({ wine: wid });
  } else {
    n = await Note.find({ wine: wid, vintage: vintage });
  }

  res.json({
    notes: n.map((nn) => nn.toObject({ getters: true })),
  });
};

// Get a Note by Id
const getNoteById = async (req, res, next) => {
  const nid = req.params.nid;
  const n = await Note.findById(nid);
  console.log("*** Get Note by id", nid);

  res.json({ note: n.toObject({ getters: true }) });
};

// Add a note
const createNote = async (req, res, next) => {
  console.log("CREATE  Note");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const {
    vintage,
    author,
    rating,
    noteText,
    drinkFrom,
    drinkTo,
    wineText,
    wine,
  } = req.body;

  const createdNote = new Note({
    vintage,
    author,
    rating,
    noteText,
    drinkFrom,
    drinkTo,
    wineText,
    wine,
  });

  try {
    await createdNote.save();
  } catch (err) {
    const error = new HttpError(
      "E026n - Creating note failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ note: createdNote });
};

// Update a note
const updateNote = async (req, res, next) => {
  // Route will validate vintage & rack is not empty
  const nid = req.params.nid;
  console.log("PATCH a note");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "E027 - Invalid inputs passed, please check your bottle data.",
        422
      )
    );
  }
  const { vintage, author, rating, noteText, drinkFrom, drinkTo } = req.body;

  let note;
  try {
    // Get the current note details
    note = await Note.findById(nid);
  } catch (err) {
    const error = new HttpError(
      "E028 - Something went wrong, could not update bottle.",
      500
    );
    return next(error);
  }

  // Update with the values to patch
  note.vintage = vintage;
  note.author = author;
  note.rating = rating;

  if (noteText) {
    note.noteText = noteText;
  }
  if (drinkFrom) {
    note.drinkFrom = drinkFrom;
  }
  if (drinkTo) {
    note.drinkTo = drinkTo;
  }

  try {
    await note.save();
  } catch (err) {
    const error = new HttpError(
      "E028N - Something went wrong, could not update/save note.",
      500
    );
    return next(error);
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

// Delete a Note by Id
const deleteNote = async (req, res, next) => {
  const nid = req.params.nid;
  await Note.deleteOne({ _id: nid });
  res.status(204).json("Deleted");
};

exports.createNote = createNote;
exports.updateNote = updateNote;
exports.getNotesByWineId = getNotesByWineId;
exports.getNoteById = getNoteById;
exports.deleteNote = deleteNote;
