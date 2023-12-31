/**
 * @fileoverview This file provides the basic MongoDB operations.
 */

"use strict";

const mongodb = require("mongodb");
const config = require("./config.json");

const mongoUrl = config.mongo.url;
const dbName = config.mongo.db;

const moment = require("moment");

const DB = {};
module.exports = DB;

let db = null;
DB.getDBConnection = async (forceNew = false) => {
  if (!forceNew && db != null) {
    return db;
  }
  const client = await mongodb.MongoClient.connect(mongoUrl);
  console.log("Connecting to MongoDB");
  console.log("Connected to MongoDB");
  db = client.db(dbName);
  return db;
};

DB.createCollection = async (db, collectionName) => {
  console.log(`Creating collection ${collectionName}`);
  await db.createCollection(collectionName);
  console.log(`Created collection ${collectionName}`);
};

DB.insertOneDocument = async (db, collectionName, document) => {
  console.log(
    `${moment().toISOString()} Inserting one document into ${collectionName}`
  );
  const collection = db.collection(collectionName);
  await collection.insert(document);
  console.log(`Inserted one document into ${collectionName}`);
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
