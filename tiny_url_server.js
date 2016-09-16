"use strict";
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

MongoClient.connect(MONGODB_URI, (err, dbInstance) => {
  if (err) {
    console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }
  console.log('Connected to the database!');
  const collection = dbInstance.collection("urls")

  require('./expressModule.js')(collection);
});