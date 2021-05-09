require("dotenv").config({ path: `./.env` });
const userAuth = require("./userAuth/userAuth.json");

/**
 * Verify if the admin user is accessing the route
 *
 * @param {Object} user The user object property username and password.
 * @param {Object} response The response from an express endpoint.
 * @return {Boolean} If user is verified or not.
 */
module.exports = function verifyUser(user, response) {
  // Auth username and password
  const authUsername = userAuth.username;
  const authPassword = userAuth.password;

  const { username, password } = user;

  if (username === authUsername && password === authPassword) {
    return true;
  } else {
    response.status(403).json({ success: false, message: "User forbidden" });
    return false;
  }
};
