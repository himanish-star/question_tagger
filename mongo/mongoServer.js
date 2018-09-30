const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = require('../config/credentials.json').Database_URI;

// Database Name
const dbName = 'question_tagger';
let db, users, problems, userTaggingStatus, problemLinks;

// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
  assert.equal(null, err);
  db = client.db(dbName);
  users = db.collection('users');
  problems = db.collection('problems');
  userTaggingStatus = db.collection('userTaggingStatus');
  problemLinks = db.collection('problemLinks');
  console.log("Connected successfully to mongodb instance");
});

const Problems = {
  //todo: complete
};

const ProblemLinks = {
  extractLinks: (query) => {
    return new Promise((res, rej) => {
      problemLinks.findOne(query, (err, data) => {
        if(err) rej(err);
        res(data);
      })
    });
  },
  insertLinks: (query) => {
    return new Promise(function(res, rej) {
      problemLinks.insertOne(query, (err, data) => {
        if(err) rej(err);
        res(data);
      })
    });
  },
  updateLinks: (query, update) => {
    return new Promise(async function(res, rej) {
      const result = await problemLinks.updateOne(query, update);
      if(!result) rej('links updation failed');
      res('links updated')
    });
  }
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

module.exports = { Users, Problems, UserTaggingStatus, ProblemLinks};
