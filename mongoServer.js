const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://root:codechef@dds-6gj6824725f15f441.mongodb.ap-south-1.rds.aliyuncs.com:3717,dds-6gj6824725f15f442.mongodb.ap-south-1.rds.aliyuncs.com:3717/admin?replicaSet=mgset-1050001620';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});
