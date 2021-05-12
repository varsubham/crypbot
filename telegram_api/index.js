require("dotenv").config({ path: `../.env` });
const axios = require("axios");
const telegram_token = process.env.telegram_token;
const chat_id = process.env.telegram_chat_id;

//base URL
const BASE_URL = "https://api.telegram.org/bot";

// send notification to telegram user
exports.sendNotification = (message) => {
  console.log(message);
  axios.get(`${BASE_URL}${telegram_token}/sendMessage`, {
    params: {
      chat_id,
      text: `${message}`,
    },
  });
};
