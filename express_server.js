const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const { getUserByEmail, generateRandomString } = require("./helpers.js");

const app = express();
const PORT = 8080; // default port 8080
const SALT = 10;

//set ejs as view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "myCookieSession",
  keys:["my-secret-word"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// DATABASES //

const urlDatabase = {};

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
  const userID = req.session["user_id"];
  if (!userID) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

//all urls
app.get("/urls", (req, res) => {
  //set cookie, and declare user variable with maching cookie
  const user = users[req.session["user_id"]];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//JSON representation of the urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//render new URL form
app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  let templateVars = {
    user: user,
  };
  //only logged in users can create new url
  if (req.session["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", {user: null});
  }
});

//redirect the user to a new page that shows them the new short url they created
app.get("/urls/:id", (req, res) => {
  const user = users[req.session["user_id"]];
  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    return res.status(404).send("URL is not found!");
  }
  const templateVars = {
    id: id,
    longURL: url.longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
});

//register page
app.get("/register", (req, res) => {
  const userID = req.session["user_id"];

  const templateVars = {
    user: null
  };
  //redirect logged in users to urls page
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("register",templateVars);
  }
});

//login page
app.get("/login", (req, res) => {
  const userID = req.session["user_id"];

  const templateVars = {
    user: null
  };
  //redirect logged in users to urls page
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("login",templateVars);
  }
});

//Create new URL
app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  //if user is not in database, deny access
  if (!userID) {
    res.status(403).send("You must be logged in to a valid account to create short URLs.");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  res.redirect(`/urls/${shortURL}`); // update the redirection URL
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});
//Update an existing URL
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const id = req.params.id;
  // check if user exists
  if (!userID) {
    return res.status(401).send("You must be logged in to do this action.");
  }
  //check if URL exist
  if (!urlDatabase[id]) {
    return res.status(404).send("Can't find the URL you are looking for!");
  }
  // check if url belongs to user
  if (urlDatabase[id].userID !== userID) {
    return res.status(403).send("You must be logged in to do this action.");
  }

  const newURL = req.body.newURL;
  urlDatabase[id].longURL = newURL;

  res.redirect("/urls");
});


//Route to longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  
  //if the id does not exist send the error message
  if (!urlDatabase[id]) {
    return res.status(404).send("Page is not found!");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

//Login route
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  //declare variable to store the found user
  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(404).send("This email cannot be found");
    return;
  }
  
  //Use bcrypt When Checking Passwords
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    res.status(403).send("Password is incorrect");
    return;
  }
  req.session["user_id"] = user.id;
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Registration handler for new user
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  //if email or password is empty, deny acces
  if (email === '' || password === '') {
    res.status(400).send("Please don't leave any field empty");
    return;
  }
  //if email is already used, deny acces
  if (getUserByEmail(email, users)) {
    res.status(400).send("This email is already used");
    return;
  }

  //create rendom id
  const id = generateRandomString();
  const salt = bcrypt.genSaltSync(SALT);
  const hashedPassword = bcrypt.hashSync(password, salt);
  //new user object
  users[id] = {id, email, password: hashedPassword};
  

  req.session["user_id"] = id;
  res.redirect("/urls");
});

//Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
