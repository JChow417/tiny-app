"use strict";

var express = require("express");
var app = express();
//var connect = require('connect');
var methodOverride = require('method-override');

function generateRandomString() {
  let numberOfChars = 6;
  let alphanumericChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let resultArr = [];
  for(let i = 0; i < numberOfChars; i++) {
    let charIndex = Math.floor(Math.random() * alphanumericChar.length);
    let char = alphanumericChar.charAt(charIndex);
    resultArr.push(char);
  }
  return resultArr.join("");
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
app.use(methodOverride('_method'));

app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL]
  let templateVars = { shortURL: shortURL, longURL: longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let urlKey = req.params.shortURL;
  let longURL = urlDatabase[urlKey];
  res.redirect(longURL);
});

app.delete("/urls/:id", (req, res) => {
  let id = req.params.id;
  console.log(id);
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.put("/urls/:id", (req, res) => {
  let id = req.params.id;
  let newLongURL = req.body.newLongURL;
  urlDatabase[id] = newLongURL;
  console.log(newLongURL);

  res.redirect("/urls/");
});

//  /urls/b2xVn2?_method=DELETE

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});