const axios = require("axios");

const HttpError = require("../models/http-error");

// const API_KEY = 'AIzaSyDgLmMpKCzveJf1_yuA0fUzzhy0WRChvZA';
const API_KEY = "AIzaSyDXhVwn1-IZwpleg4Ij8RJuWP3e1nfi0us";

async function getCoordsForAddress(address) {
  // return {
  //   // lat: 40.7484474,
  //   // lng: -73.9871516,
  //   lat: -41.3226035,
  //   lng: 174.8296158,
  // };

  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
