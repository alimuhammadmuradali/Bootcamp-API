const nodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: "znlOfGB59LGDIB8G7kuu4mzmVaBnzasF",
  formatter: null,
};

const geocoder = nodeGeocoder(options);

module.exports = geocoder;
