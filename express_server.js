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

//URLs Database Object

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  // creating templateVars object to store urlDatabase, to then be passed into urls_index
  const templateVars = {urls: urlDatabase};
  //passing templateVars into urls_index to populate the template
  res.render("urls_index", templateVars);
});

// route for rendering urls_new.ejs (form) template

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// post request for urls_new.ejs form submission

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// route for urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// FUNCTIONS

function generateRandomString() {
  let string = '';
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  console.log(string);
  return string;
};

let randomString = generateRandomString();