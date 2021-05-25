const { default: axios } = require("axios");

const baseURL = "https://api.binance.com";

// map data to array
exports.mapDataToArray = (data) => {
  let open = data.map((d) => {
    return d[1];
  });
  const high = data.map((d) => {
    return d[2];
  });
  const low = data.map((d) => {
    return d[3];
  });
  const close = data.map((d) => {
    return d[4];
  });
  const volume = data.map((d) => {
    return d[5];
  });

  return {
    open,
    high,
    low,
    close,
    volume,
  };
};

// fetch Kline data
exports.getData = (symbol, interval) => {
  return axios.get(`${baseURL}/api/v3/klines`, {
    params: {
      symbol,
      interval,
    },
  });
};
