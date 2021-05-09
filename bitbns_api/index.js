require("dotenv").config({ path: `../.env` });
const bitbnsAPI = require("bitbns");

// created object to interact with bitbns api
const bitbns = new bitbnsAPI({
  apiKey: process.env.apiKey,
  apiSecretKey: process.env.apiSecretKey,
});
