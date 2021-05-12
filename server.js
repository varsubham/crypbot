require("dotenv").config();
const express = require("express");
const verifyUser = require("./verifyUser");
const bodyParser = require("body-parser");
const { stopPriceCheck, startPriceCheck } = require("./bitbns_api");
const { sendNotification } = require("./telegram_api");
const app = express();

const PORT = process.env.PORT || 5000;

// middlewares

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// endpoints

// get notification if price hit certain value
app.post("/api/notifyPriceChange", (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };
  // verify user
  if (!verifyUser(user, res)) {
    return;
  }
  const crypto = req.body.crypto;
  const price_to_hit = req.body.price_to_hit;
  if (!crypto || !price_to_hit) {
    res.json({
      success: false,
      message: "provide crypto coin and price_to_hit",
    });
    return;
  }

  // the callback function from startPriceCheck should run
  // only once
  let runOnlyOnce = true;

  // start price check
  startPriceCheck(crypto, price_to_hit, (response) => {
    if (runOnlyOnce) {
      res.json(response);
      runOnlyOnce = false;

      // send notification to telegram that priceCheck has started
      if (response.success) {
        sendNotification(
          `PriceCheck started for ${crypto} to hit price of ₹${price_to_hit} with ID=${response.intervalId}`
        );
      }
    }
  });
});

// stop price check
app.post("/api/stopPriceCheck", (req, res) => {
  stopPriceCheck();
  res.json({
    success: true,
    message: "price check stopped",
  });
});

app.listen(PORT, () => {
  console.log(`listining on port ${PORT}`);
});
