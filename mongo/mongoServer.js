const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = require('../config/credentials.json').Database_URI;

// Database Name
const dbName = 'question_tagger';
let db, users;

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  db = client.db(dbName);
  users = db.collection('users');
  console.log("Connected successfully to mongodb instance");
});

const Users = {
  findUser: () => {

  },
  storeUser: (query) => {
    console.log('debug', query);
    return new Promise((res, rej) => {
      users.insertOne(query, (data, err) => {
        if(err) rej(err);
        res('new user created');
      })
    });
  }
};

module.exports = { Users };

