const getUserByEmail = function(email, users) {
  let user;
  for (const id in users) {
    if (users[id].email === email) {
      user = user[id];
    }
  }
  return user;
};

module.exports = { getUserByEmail };