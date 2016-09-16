"use strict";

const express = require("express");
const app = express();
//var connect = require('connect');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

app.use(bodyParser.urlencoded());
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
let PORT = process.env.PORT || 8080; // default port 8080

function generateRandomString() {
  let numberOfChars = 6;
  let alphanumericChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let resultArr = [];
  for(let i = 0; i < numberOfChars; i++) {
    let charIndex = Math.floor(Math.random() * alphanumericChar.length);
    let char = alphanumericChar.charAt(charIndex);
    resultArr.push(char);
  }
  return resultArr.join("");
}

MongoClient.connect(MONGODB_URI, (err, dbInstance) => {
  if (err) {
    console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }
  console.log('Connected to the database!');
  const collection = dbInstance.collection("urls")


  function getLongURL(collection, shortURL, cb) {
    let query = { "shortURL": shortURL };
    collection.findOne(query, (err, result) => {
      if (err) {
        return cb(err);
      }
      if (result) {
        return cb(null, result.longURL);
      } else {
        return cb(null, null);
      }
    });
  }

  function getURLs(collection, cb) {
    collection.find().toArray((err, urlArray) => {
      if(err){
        throw err;
      }
      let urlDatabase = {};
      urlArray.forEach((i) => {
        urlDatabase[i.shortURL] = [i.longURL];
      });
      cb(urlDatabase);
    });
  }


  // var urlDatabase = {
  //   "b2xVn2": "http://www.lighthouselabs.ca",
  //   "9sm5xK": "http://www.google.com"
  // };

  // app.get("/", (req, res) => {
  //   res.end("Hello!");
  // });

  app.get("/", (req, res) => {
    res.redirect("urls/new");
  });

  app.get("/urls", (req, res) => {
    getURLs(collection, (urlDatabase) => {
      res.render("urls_index", {urls: urlDatabase})
    });
  });

  app.post("/urls", (req, res) => {
    let longURL = req.body.longURL;  // debug statement to see POST parameters
    getURLs(collection, (urlDatabase) => {
      let newKey = generateRandomString();
      while (urlDatabase.hasOwnProperty(newKey)) {
         newKey = generateRandomString();
      }
      let urlObject = {"shortURL": newKey, "longURL": longURL};
      collection.insert(urlObject, (err, doc) => {
        if(err){
          throw err;
        }
        res.redirect("/urls/" + newKey);         // Respond with 'Ok' (we will replace this)
      });
    })
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    getLongURL(collection, shortURL, (err, longURL) => {
      if(longURL !== null) {
        let templateVars = { shortURL: shortURL, longURL: longURL};
        res.render("urls_show", templateVars);
      } else {
        res.status(404);
        res.send("SHORT URL DOES NOT EXIST");
      }
    });
  });
  // OTHERWISE GIVE ERROR MSG
  // REMEMBER TO HAVE STATUS CODE eg. 4XX

  app.put("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    let newLongURL = req.body.newLongURL;
    collection.update(
      {'shortURL': shortURL},
      { $set : {'longURL': newLongURL}},() => {
      res.redirect("/urls/");
    });
  });

  app.delete("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    collection.remove({'shortURL': shortURL},() => {
      res.redirect("/urls");
    });
  });

  app.get("/u/:id", (req, res) => {
    let shortURL = req.params.id;
    getLongURL(collection, shortURL, (err, longURL) => {
      if(longURL !== null) {
        res.redirect(longURL);
      } else {
        res.status(404);
        res.send("SHORT URL DOES NOT EXIST");
      }
    });
  });
  // OTHERWISE GIVE ERROR MSG
  // REMEMBER TO HAVE STATUS CODE eg. 4XX

  // app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });

  // app.get("/hello", (req, res) => {
  //   res.end("<html><body>Hello <b>World</b></body></html>\n");
  // });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
});