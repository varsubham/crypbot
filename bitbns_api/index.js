require("dotenv").config({ path: `../.env` });
const bitbnsAPI = require("bitbns");
const { sendNotification } = require("../telegram_api");
const { generateId, pushId } = require("../ids");

//Global variables
let intervalObj = {};

// created object to interact with bitbns api
const bitbns = new bitbnsAPI({
  apiKey: process.env.apiKey,
  apiSecretKey: process.env.apiSecretKey,
});

// TODO: add functionality to clearInterval
// using a intervalId
exports.stopPriceCheck = () => {
  clearInterval(intervalObj);
};

exports.startPriceCheck = (crypto, price_to_hit, callback) => {
  const newIntervalObjId = generateId();
  const newIntervalObj = setInterval(() => {
    checkPrice(crypto, price_to_hit, callback, newIntervalObjId);
  }, 2000);
  intervalObj[newIntervalObjId] = newIntervalObj;
};

function clearTheInterval(id) {
  const interval = intervalObj[id];
  clearInterval(interval);
  delete intervalObj[id];
  pushId(id);
}

function checkPrice(crypto, price_to_hit, callback, newIntervalId) {
  bitbns.getTickerApi(crypto, (err, data) => {
    if (!err && data.status == 1) {
      // !err in getTickerApi i.e., getTickerApi started looking for crypto price
      callback({
        success: true,
        message: "Price check started",
        intervalId: newIntervalId,
      });
      try {
        if (typeof data.data !== "string") {
          if (data.data[crypto].last_traded_price > price_to_hit) {
            // clear interval
            clearTheInterval(newIntervalId);
            console.log("price hit");

            // send notification to telegram bot
            sendNotification(`${crypto} is more than ₹${price_to_hit}`);
            return;
          } else console.log(data.data[crypto].last_traded_price);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      callback({ success: false, err });
      console.log(err);
    }
  });
}
