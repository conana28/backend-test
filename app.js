const fs = require("fs");
const path = require("path");
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const bottlesRoutes = require("./routes/bottles-routes");
const consumedRoutes = require("./routes/consumed-routes");
const winesRoutes = require("./routes/wines-routes");
const notesRoutes = require("./routes/notes-routes");
const otherRoutes = require("./routes/other-routes");

const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});
//
app.use("/api/bottles", bottlesRoutes);
app.use("/api/consumed", consumedRoutes);
app.use("/api/wines", winesRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/other", otherRoutes);

app.use((req, res, next) => {
  const error = new HttpError("E003-Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "E004-An unknown error occurred!" });
});

mongoose
  .connect(
    // "mongodb://localhost:27017/winetrak"
    // "mongodb+srv://wtuser:8fOMKjrds9dlcW8K@cluster0.nfbtbop.mongodb.net/winetrak?retryWrites=true&w=majority"
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nfbtbop.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
    console.log("Mongodb connected on Port 5000");
  })
  .catch((err) => {
    console.log(err);
  });
