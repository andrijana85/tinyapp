const getUserByEmail = function(email, users) {
  let user;
  for (const id in users) {
    if (users[id].email === email) {
      user = users[id];
    }
  }
  return user;
};

//implement a function that returns a string of 6 random alphanumeric characters
const generateRandomString = function() {
  let characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortURL = "";
  for (let i = 0; i <= 5; i++) {
    let rendChar = Math.floor(Math.random() * characters.length);
    shortURL += characters.charAt(rendChar);
  }
  return shortURL;
};

module.exports = { getUserByEmail, generateRandomString};