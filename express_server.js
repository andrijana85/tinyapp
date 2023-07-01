const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

//set ejs as view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const getUserByEmail = function(email, users) {
  let user;
  for (const id in users) {
    if (users[id].email === email) {
      user = user[id];
    }
  }
  return user;
};

// DATABASES //

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//ROUTES//

//route to root
app.get("/", (req, res) => {
  res.send("Hello!");
});

//all urls
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

//JSON representation of the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//render new URL form
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  if (req.cookies.user_id) {
    res.render("urls/new", {user});
  } else {
    res.render("login", {user: null});
  }
});

//redirect the user to a new page that shows them the new short url they created
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    id: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user,
  };
  res.render("urls_show", templateVars);
});

//register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("register",templateVars);
});

//login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("login",templateVars);
});

//Create new URL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`); // update the redirection URL
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL] = newURL;
  }
  res.redirect("/urls");
});

//Route to longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  //if the id does not exist send the error message
  if (!urlDatabase[shortURL]) {
    res.status(404).send("Page is not found!");
  }
  res.redirect(longURL);
});

//Login route
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!getUserByEmail(email, users)) {
    res.status(403).send("This email cannot be found");
  }
  const user = getUserByEmail(email, users);

  if (user.password !== password) {
    res.status(403).send("Password is not correct!");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Registration handler for new user
app.post("/register", (req, res) => {
  const {email, password} = req.body;

  if (email === " " || password === " ") {
    res.status(400).send("Please don't leave any field empty");
    return;
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("This email is already used");
  }


  const id = generateRandomString();
  users[id] = {id, email, password};
  

  res.cookie("user_id", id);
  res.redirect("/urls");
});

//Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
