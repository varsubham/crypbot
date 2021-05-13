require("dotenv").config({ path: `../.env` });
const bitbnsAPI = require("bitbns");
const { sendNotification } = require("../telegram_api");
const { generateId, pushId } = require("../ids");
const _ = require("lodash");

//Global variables
let intervalObj = {};

// created object to interact with bitbns api
const bitbns = new bitbnsAPI({
  apiKey: process.env.apiKey,
  apiSecretKey: process.env.apiSecretKey,
});

exports.stopPriceCheck = (intervalId, callback) => {
  if (intervalObj[intervalId]) {
    clearTheInterval(intervalId);
    callback({
      success: true,
      message: `Stopped priceCheck for id ${intervalId}`,
    });
  } else {
    callback({ success: false, message: `Send a valid intervalId` });
  }
};

exports.stopAllPriceCheck = (callback) => {
  if (_.isEmpty(intervalObj)) {
    callback({ success: false, message: "No process running" });
    return;
  }
  let stopPriceCheckArr = [];
  for (let key in intervalObj) {
    if (intervalObj.hasOwnProperty(key)) {
      this.stopPriceCheck(key, (response) => {
        stopPriceCheckArr.push(response);
      });
    }
  }
  if (_.isEmpty(intervalObj)) {
    callback({ success: true, stopPriceCheckArr });
  } else {
    callback({ success: false });
  }
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

function getLastTradedPrice(crypto) {
  const promise = new Promise((resolve, reject) => {
    bitbns.getTickerApi(crypto, (err, data) => {
      if (!err) {
        resolve(data.data[crypto].last_traded_price);
      } else {
        reject(err);
      }
    });
  });
  return promise;
}

function getCryptoSymb(key) {
  const availableOrder = "availableorder";
  const inOrder = "inorder";
  const crypto = key.startsWith(availableOrder)
    ? key.substr(availableOrder.length, key.length - availableOrder.length)
    : key.startsWith(inOrder)
    ? key.substr(inOrder.length, key.length - inOrder.length)
    : null;
  return crypto;
}

exports.getCurrentPortfolio = (callback) => {
  let currentPortfolio = 0.0;
  bitbns.currentCoinBalance("EVERYTHING", async function (error, data) {
    if (!error) {
      const obj = data.data;
      for (const key of Object.keys(obj)) {
        if (obj[key] != 0) {
          const crypto = getCryptoSymb(key);
          if (crypto === "Money") {
            currentPortfolio += obj[key];
          } else {
            const cryptoPrice = await getLastTradedPrice(crypto);
            currentPortfolio += cryptoPrice * obj[key];
          }
        }
      }
      callback({
        success: true,
        currentPortfolio: `₹${currentPortfolio.toFixed(2)}`,
      });
    } else {
      console.log("Error ::", error);
      callback({ success: false, error });
    }
  });
};
