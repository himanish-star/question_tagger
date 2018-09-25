const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = require('../config/credentials.json').Local_URI;

// Database Name
const dbName = 'question_tagger';
let db, users, problems, userTaggingStatus;

// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
  assert.equal(null, err);
  db = client.db(dbName);
  users = db.collection('users');
  problems = db.collection('problems');
  userTaggingStatus = db.collection('userTaggingStatus');
  console.log("Connected successfully to mongodb instance");
});

const Problems = {
  //todo: complete
};

const UserTaggingStatus = {
  extractQuestions: (query) => {
    return new Promise((res, rej) => {
      userTaggingStatus.findOne(query, (err, data) => {
        if(err) rej(err);
        res(data);
      })
    });
  },
  insertQuestions: (query) => {
    return new Promise(function(res, rej) {
      userTaggingStatus.insertOne(query, (err, data) => {
        if(err) rej(err);
        res(data);
      })
    });
  },
  updateQuestions: (query, update) => {
    return new Promise(async function(res, rej) {
      const result = await userTaggingStatus.updateOne(query, update);
      if(!result) rej('question updation failed');
      res('questions updated')
    });
  }
};

const Users = {
  findUser: (query) => {
    return new Promise((res, rej) => {
      users.findOne(query, (err, data) => {
        if(err) rej(err);
        res(data);
      })
    });
  },
  updateUser: (query, update) => {
    return new Promise(async (res, rej) => {
      const result = await users.updateOne(query, update);
      if(!result) rej('updation failed')
      res('user details updated');
    })
  },
  storeUser: (query) => {
    return new Promise((res, rej) => {
      users.insertOne(query, (err, data) => {
        if(err) rej(err);
        res('new user created');
      })
    });
  }
};

module.exports = { Users, Problems, UserTaggingStatus };
