"use strict";
const express = require("express");
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const func = require("./functionsModule.js");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

module.exports = function(collection){

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));
  app.set("view engine", "ejs");
  app.use(express.static(__dirname + '/public'));

  app.get("/", (req, res) => {
    res.redirect("urls/new");
  });

  app.get("/urls", (req, res) => {
    func.getURLs(collection, (urlDatabase) => {
      let hostName = req.headers.host;
      res.render("urls_index", {urls: urlDatabase, 'hostName': hostName})
    });
  });

  app.post("/urls", (req, res) => {
    let longURL = req.body.longURL;  // debug statement to see POST parameters
    func.getURLs(collection, (urlDatabase) => {
      let newKey;
      do {
         newKey = func.generateRandomString();
      } while (urlDatabase.hasOwnProperty(newKey));
      let urlObject = {"shortURL": newKey, "longURL": longURL};
      collection.insert(urlObject, (err, doc) => {
        if (err) {
          throw err;
        }
        res.redirect("/urls/" + newKey);         // Respond with 'Ok' (we will replace this)
      });
    });
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    func.getLongURL(collection, shortURL, (err, longURL) => {
      if(longURL !== null) {
        let hostName = req.headers.host;
        let templateVars = {shortURL: shortURL, longURL: longURL, "hostName": hostName};
        res.render("urls_show", templateVars);
      } else {
        res.status(404);
        res.render("page_not_found");
      }
    });
  });

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
    collection.remove(
      {'shortURL': shortURL},() => {
      res.redirect("/urls");
    });
  });

  app.get("/u/:id", (req, res) => {
    let shortURL = req.params.id;
    func.getLongURL(collection, shortURL, (err, longURL) => {
      if(longURL !== null) {
        res.redirect(301, longURL);
      } else {
        res.status(404);
        res.render("page_not_found");
      }
    });
  });

  app.get(/.*/, (req, res) => {
    res.render("page_not_found");
  });

  app.listen(PORT, () => {
    console.log(`Tiny URL app listening on port ${PORT}!`);
  });
};



