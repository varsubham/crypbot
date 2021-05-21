const { default: axios } = require("axios");
const Queue = require("../datastructure/queue");
const { sendNotification } = require("../telegram_api/index");
const { getLastTradedPrice } = require("../bitbns_api/index");

//Global variable
const baseURL = "https://api.binance.com";

function fetchKlinesData(crypto, chartInterval, limit) {
  const promise = new Promise((resolve, reject) => {
    axios
      .get(`${baseURL}/api/v3/klines`, {
        params: {
          symbol: crypto,
          interval: chartInterval,
          limit: limit,
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
}

function getLatestPrice(crypto) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${baseURL}/api/v3/ticker/price`, {
        params: {
          symbol: crypto,
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function initQueue(crypto, queueSize, chartInterval) {
  const queue = new Queue(queueSize);

  try {
    const dataArray = await fetchKlinesData(crypto, chartInterval, queueSize);
    dataArray.forEach((val) => {
      let obj = {
        open_time: val[0],
        open_price: val[1],
        high_price: val[2],
        low_price: val[3],
        close_price: val[4],
        close_time: val[6],
      };
      queue.enqueue(obj);
    });
    return queue;
  } catch (err) {
    console.log(err);
  }
}

function updateQueue(crypto, chartInterval, queue) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${baseURL}/api/v3/klines`, {
        params: {
          symbol: crypto,
          interval: chartInterval,
          limit: 1,
        },
      })
      .then((res) => {
        const val = res.data;
        let obj = {
          open_time: val[0][0],
          open_price: val[0][1],
          high_price: val[0][2],
          low_price: val[0][3],
          close_price: val[0][4],
          close_time: val[0][6],
        };
        queue.pushKline(obj);
        resolve(queue);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function startCheck(crypto, percentGain, chartInterval, queueSize) {
  try {
    let queue = await initQueue(crypto, queueSize, chartInterval);

    const intervalObj = setInterval(() => {
      updateQueue(crypto, chartInterval, queue).then((res) => {
        queue = res;
        const lastElement = queue.back();
        const secondLastElement = queue.getElement(queue.getLength() - 2);
        let percentChange =
          ((parseFloat(lastElement.close_price) -
            parseFloat(secondLastElement.close_price)) *
            100) /
          parseFloat(secondLastElement.close_price);
        if (percentChange >= percentGain) {
          // send a notification to telegram
          clearInterval(intervalObj);
          console.log("yeahhh", crypto);
          sendNotification(`${crypto} price more than ${percentChange}`);
          return;
        }
        console.log(percentChange, "  ", crypto);
      });
    }, 2000);
  } catch (error) {
    throw error;
  }
}

// compare price
function comparePrice(crypto) {
  return new Promise(async (resolve, reject) => {
    let bitbnsPrice;
    let binancePrice;
    try {
      bitbnsPrice = await getLastTradedPrice(`${crypto}USDT`);
      binancePrice = await getLatestPrice(`${crypto}USDT`);
    } catch (err) {
      reject(err);
    }
    const percentChange = Math.abs(
      ((bitbnsPrice - parseFloat(binancePrice.price)) * 100) /
        Math.min(bitbnsPrice, parseFloat(binancePrice.price))
    );
    resolve(percentChange);
  });
}

// start compare price
function startComparePrice(crypto, thresholdPercent) {
  const intervalObj = setInterval(() => {
    comparePrice(crypto)
      .then((res) => {
        if (res >= thresholdPercent) {
          // send notification to telegram
          sendNotification(`${crypto} is more than ${res}%`);
          clearInterval(intervalObj);
        } else {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
        clearInterval(intervalObj);
      });
  }, 2000);
}

startComparePrice("BTC", 3);
