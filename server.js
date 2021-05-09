require("dotenv").config();
const express = require("express");
const verifyUser = require("./verifyUser");
const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT || 5000;

// middlewares

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// endpoints

/**
 * Returns x raised to the n-th power.
 *
 * @param {number} x The number to raise.
 * @param {number} n The power, must be a natural number.
 * @return {number} x raised to the n-th power.
 */
app.post("/api/notifyPriceChange", (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };
  // verify user
  if (!verifyUser(user, res)) {
    return;
  }

  // send something
  res.json({
    success: true,
    message: "hello from express",
  });
});

app.listen(PORT, () => {
  console.log(`listining on port ${PORT}`);
});
