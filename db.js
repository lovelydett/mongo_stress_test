/**
 * @fileoverview This file provides the basic MongoDB operations.
 */

"use strict";

const mongodb = require("mongodb");

const mongoUrl =
  "mongodb://internal.sentimac.org:27017/test_ai_vetting_tool?directConnection=true";
const dbName = "test_ai_vetting_tool";

const moment = require("moment");

const DB = {};
module.exports = DB;

let client = null;
DB.getDBConnection = async () => {
  console.log("Connecting to MongoDB");
  if (client == null) {
    client = await mongodb.MongoClient.connect(mongoUrl);
  }
  console.log("Connected to MongoDB");
  const db = client.db(dbName);
  return db;
};

DB.createCollection = async (db, collectionName) => {
  console.log(`Creating collection ${collectionName}`);
  await db.createCollection(collectionName);
  console.log(`Created collection ${collectionName}`);
};

DB.insertDocuments = async (db, collectionName, documents) => {
  console.log(
    `${moment().toISOString()} Inserting a batch of ${
      documents.length
    } documents into ${collectionName}`
  );
  const collection = db.collection(collectionName);
  await collection.insertMany(documents);
  console.log(`Inserted ${documents.length} documents into ${collectionName}`);
};
