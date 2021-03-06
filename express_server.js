const {findUserByEmail} = require('./helpers.js');

const express = require("express");
const app = express();
const PORT = 8080;

// setting EJS as the template engine
app.set("view engine", "ejs");

// adding body parser library
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// requiring cookie session
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["tiny app secret key"],

  maxAge: 24 * 60 * 60 * 1000
}));

// requiring bcrypt
const bcrypt = require('bcryptjs');

//URLs Database Object
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// Users Database Object

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("abc", 10)

  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};


// ROUTE HANDLERS

// route to /urls
app.get("/urls", (req, res) => {
  const loggedInUserURLs = urlsForUser(req.session.user, urlDatabase);
  const userIdfromCookie = req.session.user;
  const result = findUserByUser_ID(userIdfromCookie);
  const templateVars = {urls: loggedInUserURLs, user: result};

  //passing templateVars into urls_index to populate the template
  res.render("urls_index", templateVars);
});

// route for rendering urls_new.ejs (form) template
app.get("/urls/new", (req, res) => {

  // if user is not logged in when trying to access create new url page, redirect them to the login page
  if (!req.session.user) {
    res.redirect("/login");
  }
  const userIdfromCookie = req.session.user;
  const result = findUserByUser_ID(userIdfromCookie);
  const templateVars = {urls: urlDatabase, user: result};

  res.render("urls_new", templateVars);
});

// post request for urls_new.ejs form submission
app.post("/urls", (req, res) => {

  if (!req.session.user) {
    res.status(400).send("you are not authorized for this action");
  }
  // console.log(req.body);
  const newShortURL = generateRandomString();
  console.log(newShortURL);

  // adding newshortURL-longURL key-value pair to the urlDatabase
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user
  };

  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
  console.log("database: ", urlDatabase);
});

// route for urls_show
app.get("/urls/:shortURL", (req, res) => {

  if (!req.session.user) {
    res.status(400).send("you are not authorized for this action. Please log in!");
  }

  const userIdfromCookie = req.session.user;
  const result = findUserByUser_ID(userIdfromCookie);
  const templateVars = {user: result, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);

});

// route to redirect short URLs to their coresponding long URLs

app.get("/u/:shortURL", (req, res) => {
  const longURLdata = urlDatabase[req.params.shortURL];
  res.redirect(longURLdata.longURL);


});

// deleting URL from urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {

  if (!req.session.user) {
    res.status(400).send("you cant delete this url");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Updating URLs

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session.user) {
    res.status(400).send("you cant edit this url");
  }

  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = newURL;
  res.redirect("/urls");
});

// Login Route
app.post("/login", (req, res) => {

  const value = req.body.email;
  const user = findUserByEmail(value, users);
  const password = req.body.password;

  //if that user cannot be located in the database
  if (!user) {
    return res.status(403).send("user with that e-mail cannot be found");
  }

  // if the user is located in the database but the password is wrong (ie not in the database)
  console.log("TEST:", password, user.password);
  if (user && bcrypt.compareSync(password, user.password) === false) {
    return res.status(403).send("wrong password");
  }

  //if the user is located in the database and the password matches that user

  if (user && bcrypt.compareSync(password, user.password) === true) {
    req.session.user = user.id;
    res.redirect("/urls");
  }

});


// logout
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/login");
});


// registration endpoint that renders the registration page to the browser
app.get("/register", (req, res) => {
  const templateVars = {urls: urlDatabase, user: null};
  res.render("register", templateVars);
});

// registration endpoint that handles the registration form data

app.post("/register", (req, res) => {
  // generate random user ID
  const userRandomID = generateRandomString();

  // email
  const userEmail = req.body.email;

  //password
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  // Error handling
  if (userEmail === "" || userPassword === "") {
    return res.status(400).send("email and password cannot be blank");
  }

  if (findUserByEmail(userEmail, users)) {
    return res.status(400).send("email is already registered");
  }

  // new user object
  const newUser = users[userRandomID] = {
    id: userRandomID,
    email: userEmail,
    password: hashedPassword
  };
  console.log(users);

  req.session.user = newUser.id;
  res.redirect("/urls");
});


// login form endpoint

app.get("/login", (req, res) => {
  const userIdfromCookie = req.session.user;
  const result = findUserByUser_ID(userIdfromCookie);
  const templateVars = {urls: urlDatabase, user: result};
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// FUNCTIONS

function generateRandomString() {
  let string = '';
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
}

function findUserByUser_ID(user_id) {
  for (const user in users) {
    console.log("users: ", users[user]);
    if (users[user].id === user_id) {
      return users[user];
    }
  }
  return false;
}

function urlsForUser(userId, urlDatabase) {

  const urls = {};
  console.log('user', userId, 'db', urlDatabase);
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userId) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

