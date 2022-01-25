const express = require("express");
const app = express();
const PORT = 8080;

// setting EJS as the template engine
app.set("view engine", "ejs");



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

// route for urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);

});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



