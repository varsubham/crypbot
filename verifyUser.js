require("dotenv").config();
/**
 * Verify if the admin user is accessing the route
 *
 * @param {Object} user The user object property username and password.
 * @param {Object} response The response from an express endpoint.
 * @return {Boolean} If user is verified or not.
 */
module.exports = function verifyUser(user, response) {
  // correct username and password
  const authUsername = process.env.username;
  const authPassword = process.env.password;

  const { username, password } = user;
  console.log(typeof username);

  if (username === authUsername && password === authPassword) {
    return true;
  } else {
    response.status(403).send("User is forbidden");
    return false;
  }
};
