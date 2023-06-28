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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
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

//route to root
app.get("/", (req, res) => {
  res.send("Hello!");
});
//render list of longURL with their shortURL
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//render new URL form
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});
//redirect the user to a new page that shows them the new short url they created
app.get("/urls/shortURL", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    id: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user,
  };
  res.render("urls_show", templateVars);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//register page
app.get("/register", (req, res) => {
  res.render("register");
});
//create new URL
app.post("/urls", (req, res) => {
  const longURL = req.body;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL["longURL"];
  res.redirect(`urls/${shortURL}`); // update the redirection URL
});
//route to longURL
app.get("/u/:shortId", (req, res) => {
  const shortURL = req.params.id;
  console.log(shortURL);
  const longURL = urlDatabase[shortURL];
  console.log(shortURL);
  res.redirect(longURL);
});
//delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
//route to EditURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls${shortURL}`);
});
//Edit URL
app.post("/urls/:shortURL/submit", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.params.newURL;
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL] = newURL;
  }
  res.redirect("/urls");
});
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
//Login route
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//registration handler for new user
app.post("/register", (req, res) => {
// const email = req.body.email;
// const password = req.body.password;
  const {email, password} = req.body;

  const id = generateRandomString();
  users[id] = {id, email, password};
  // console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls");
  
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
