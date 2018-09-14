const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = require('../config/credentials.json').Database_URI;

// Database Name
const dbName = 'question_tagger';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to mongodb instance");

  const db = client.db(dbName);
  const users = db.collection('users');

  const Users = {
    findUser: () => {

    },
    storeUser: (query) => {
      return new Promise((res, rej) => {
        users.createOne((query, err) => {
          if(err) rej(err);
          res('new user created');
        })
      });
    }
  };
});

module.exports = { Users };
