const { default: axios } = require("axios");
const Queue = require("../datastructure/queue");
const { sendNotification } = require("../telegram_api/index");

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
        console.log(percentChange);
      });
    }, 2000);
  } catch (error) {
    throw error;
  }
}
