require("dotenv").config({ path: `../.env` });
const bitbnsAPI = require("bitbns");
const sendNotification = require("../telegram_api");

// created object to interact with bitbns api
const bitbns = new bitbnsAPI({
  apiKey: process.env.apiKey,
  apiSecretKey: process.env.apiSecretKey,
});

let intervalObj;
let runOnlyOnce;

exports.stopPriceCheck = () => {
  clearInterval(intervalObj);
};

exports.startPriceCheck = (crypto, price_to_hit, callback) => {
  runOnlyOnce = true;
  intervalObj = setInterval(() => {
    checkPrice(crypto, price_to_hit, callback);
  }, 1000);
};

function checkPrice(crypto, price_to_hit, callback) {
  bitbns.getTickerApi(crypto, (err, data) => {
    if (!err && data.status == 1) {
      // !err in getTickerApi i.e., getTickerApi started look for crypto price
      if (runOnlyOnce) {
        callback({ success: true, message: "Price check started" });
        runOnlyOnce = false;
      }
      try {
        if (typeof data.data !== "string") {
          if (data.data[crypto].last_traded_price > price_to_hit) {
            clearInterval(intervalObj);
            console.log("price hit");
            // send notification to telegram bot
            sendNotification(crypto, price_to_hit);
            return;
          } else console.log(data.data[crypto].last_traded_price);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      if (runOnlyOnce) {
        callback({ success: false, err });
        runOnlyOnce = false;
      }
      console.log(err);
    }
  });
}
