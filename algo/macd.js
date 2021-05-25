const tulind = require("tulind");
const { mapDataToArray, getData } = require("./util");

module.exports = macd = (symbol, interval, options = [12, 36, 9]) => {
  const promise = new Promise((resolve, reject) => {
    getData(symbol, interval).then((res) => {
      // map data to array
      const { close } = mapDataToArray(res.data);
      tulind.indicators.macd.indicator([close], options, (err, data) => {
        if (!err) resolve(data);
        else reject(err);
      });
    });
  });
  return promise;
};
