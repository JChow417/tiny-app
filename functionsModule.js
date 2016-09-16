"use strict";
module.exports = {

  getLongURL: function(collection, shortURL, cb) {
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
  },

  getURLs: function(collection, cb) {
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
  },

  generateRandomString: function() {
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

}
