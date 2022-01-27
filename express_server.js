const express = require("express");
const app = express();
const PORT = 8080;

// setting EJS as the template engine
app.set("view engine", "ejs");

// adding body parser library
// converts the request body from a Buffer into string
// then adds the data to the req(request) object under the key body (store it in body)
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// requiring cookie parser 
// helps us read the values from cookies
const cookieParser = require('cookie-parser');
const {redirect} = require("express/lib/response");
app.use(cookieParser())

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

//

// Users Database Object

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


// ROUTE HANDLERS

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




// route to /urls
app.get("/urls", (req, res) => {
  const loggedInUserURLs = urlsForUser(req.cookies.user, urlDatabase);

  // creating templateVars object to store urlDatabase, to then be passed into urls_index

  console.log(req.cookies);
  console.log(req.cookies.user);
  const userIdfromCookie = req.cookies.user;


  const result = findUserByUser_ID(userIdfromCookie);

  const templateVars = {urls: loggedInUserURLs, user: result};

  //passing templateVars into urls_index to populate the template
  res.render("urls_index", templateVars);
});

// route for rendering urls_new.ejs (form) template

//*** */
app.get("/urls/new", (req, res) => {

  // if user is not logged in when trying to access create new url page, redirect them to the login page
  if (!req.cookies.user) {
    res.redirect("/login")
  }

  const userIdfromCookie = req.cookies.user;
  const result = findUserByUser_ID(userIdfromCookie);

  const templateVars = {urls: urlDatabase, user: result};




  // const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// post request for urls_new.ejs form submission

app.post("/urls", (req, res) => {

  if (!req.cookies.user) {
    res.status(400).send("you are not authorized for this action")
  }
  // console.log(req.body);
  const newShortURL = generateRandomString();
  console.log(newShortURL);

  // adding newshortURL-longURL key-value pair to the urlDatabase
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user
  };

  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);

  console.log("database: ", urlDatabase);


});

// route for urls_show
app.get("/urls/:shortURL", (req, res) => {

  const userIdfromCookie = req.cookies.user;
  const result = findUserByUser_ID(userIdfromCookie);
  // const templateVars = {urls: urlDatabase, user: result};
  console.log(urlDatabase[req.params.shortURL]);
  const templateVars = {user: result, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);

});

// route to redirect short URLs to their coresponding long URLs

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

// deleting URL from urlDatabase
// redirecting to /urls
app.post("/urls/:shortURL/delete", (req, res) => {

  if (!req.cookies.user) {
    res.status(400).send("you cant delete this url");
  };

  //for curl

  // const loggedInUserURLs = urlsForUser(req.cookies.user, urlDatabase);
  // if (!loggedInUserURLs) {
  //   return res.status(400).send("you cant edit this url");
  // };
  // for (const url of loggedInUserURLs) {
  //   if (url !== req.params.shortURL) {
  //     res.status(400).send("you cant delete this url");
  //   }
  // }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW"
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW"
//   }
// };


// Updating URLs

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.cookies.user) {
    res.status(400).send("you cant edit this url");
  };


  // const loggedInUserURLs = urlsForUser(req.cookies.user, urlDatabase);
  // if (!loggedInUserURLs) {
  //   res.status(400).send("you cant edit this url");
  // };
  // for (const url of loggedInUserURLs) {
  //   if (url !== req.params.shortURL) {
  //     res.status(400).send("you cant edit this url");
  //   }
  // }

  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = newURL;
  res.redirect("/urls");
});

// Login Route
// sets cookie names username to value submitted in the request body via the login form.
//redirects to /urls

// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// };


app.post("/login", (req, res) => {

  const value = req.body.email;
  const user = findUserByEmail(value);
  console.log("USER:", user, user.password);
  const password = req.body.password;


  //if that user cannot be located in the database
  if (!user) {
    return res.status(403).send("user with that e-mail cannot be found");
  }

  // if the user is located in the database but the password is wrong (ie not in the database)

  console.log("TEST:", password, user.password)
  if (user && bcrypt.compareSync(password, user.password) === false) {
    return res.status(403).send("wrong password");
  }


  // if (user && password !== user.password) {
  //   return res.status(403).send("wrong password");
  // }

  //if the user is located in the database and the password matches that user


  // if (user && password === user.password) {
  //   res.cookie("user", user.id);
  //   res.redirect("/urls");

  if (user && bcrypt.compareSync(password, user.password) === true) {
    res.cookie("user", user.id);
    res.redirect("/urls");
  }

});


// logout 
// clears the username cookie
// redirects the user back to the /urls

app.post("/logout", (req, res) => {

  res.clearCookie("user");
  res.redirect("/urls");
});


// registration endpoint that renders the registration page to the browser 
app.get("/register", (req, res) => {

  const templateVars = {urls: urlDatabase, user: null};

  res.render("register", templateVars)
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

  if (findUserByEmail(userEmail)) {
    return res.status(400).send("email is already registered");
  };

  // new user object 
  const newUser = users[userRandomID] = {
    id: userRandomID,
    email: userEmail,
    password: hashedPassword
  }
  console.log(users);

  res.cookie("user", newUser.id);

  res.redirect("/urls");
});


// login form endpoint

app.get("/login", (req, res) => {
  const userIdfromCookie = req.cookies.user;
  const result = findUserByUser_ID(userIdfromCookie);

  const templateVars = {urls: urlDatabase, user: result};

  console.log(templateVars.user);

  res.render("login", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






// FUNCTIONS

// 

function generateRandomString() {
  let string = '';
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // console.log(string);
  return string;
};


function findUserByUser_ID(user_id) {
  for (const user in users) {
    console.log("users: ", users[user])
    if (users[user].id === user_id) {
      return users[user];
    }
  }

  return false;
}


// function to search for email in users database

function findUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
}


function urlsForUser(userId, urlDatabase) {

  const urls = {};
  console.log('user', userId, 'db', urlDatabase)
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userId) {
      urls[url] = urlDatabase[url];
    }
  }

  console.log(urls);

  return urls;
}

