/**
 * @fileoverview This file is to create mocking data for testing.
 */

"use strict";

const DB = require("./db");
const dataMocker = require("./data_mocker");

/******* Begins the logic of this file *******/
const initer = {};
const inserter = {};
module.exports = {
  initer: initer,
  inserter: inserter,
};

const NUMBER_DOCUMENTS = 150000000;

// collection initializers
initer.initDocuments = async () => {
  console.log("initializing documents");
  // Step1: create the "documents" collection, if exists, drop it
  const db = await DB.getDBConnection();
  await db.collection("documents").drop();
  await DB.createCollection(db, "documents");

  // Step2: create indices
  await db
    .collection("documents")
    .createIndex({ document_id: 1 }, { unique: true });
  await db.collection("documents").createIndex({ available: 1 });
  await db
    .collection("documents")
    .createIndex({ "headline_codes.latest.all": 1 });
  await db.collection("documents").createIndex({ release_time: 1 });
  await db.collection("documents").createIndex({ stock_code: 1 });
  await db.collection("documents").createIndex({ stock_short_name: 1 });
  await db.collection("documents").createIndex({ vetting_enabled: 1 });
  await db.collection("documents").createIndex({ jura_enabled: 1 });
  await db.collection("documents").createIndex({ flagged_by: 1 });
  await db.collection("documents").createIndex({ number_of_critical_items: 1 });
  await db.collection("documents").createIndex({
    number_of_non_critical_items: 1,
  });
  await db
    .collection("documents")
    .createIndex({ "checklists.contents.checklist": 1 });
  await db.collection("documents").createIndex({ filing_title: 1 });
  console.log("documents initialized");
};

initer.initResponsibleTeam = async () => {
  console.log("initializing responsible team");
  // Step1: create the "teams" collection, if exists, drop it
  const db = await DB.getDBConnection();
  await db.collection("teams").drop();
  await DB.createCollection(db, "teams");

  // Step2: create indices
  await db.collection("teams").createIndex({ stock_code: 1 }, { unique: true });
  console.log("responsible team initialized");
};

initer.initChecklists = async () => {
  console.log("initializing checklists");
  const db = await DB.getDBConnection();
  await db.collection("checklists").drop();
  await DB.createCollection(db, "checklists");

  await db
    .collection("checklists")
    .createIndex({ document_id: 1 }, { unique: true });
  console.log("checklists initialized");
};
initer.initMatrixEvents = async () => {
  console.log("initializing matrix_events");
  const db = await DB.getDBConnection();
  await db.collection("matrix_events").drop();
  await DB.createCollection(db, "matrix_events");

  await db
    .collection("matrix_events")
    .createIndex({ document_id: 1 }, { unique: true });
  console.log("matrix_events initialized");
};

initer.initEventValues = async () => {
  console.log("initializing event_values");
  const db = await DB.getDBConnection();
  await db.collection("event_values").drop();
  await DB.createCollection(db, "event_values");

  await db
    .collection("event_values")
    .createIndex({ event_id: 1 }, { unique: true });
};

initer.initEditHistory = async () => {
  console.log("initializing edit_history");
  const db = await DB.getDBConnection();
  await db.collection("edit_history").drop();
  await DB.createCollection(db, "edit_history");

  await db
    .collection("edit_history")
    .createIndex({ document_id: 1 }, { unique: true });
};

initer.initTaggingTypes = async () => {
  console.log("initializing tagging_types");
  const db = await DB.getDBConnection();
  await db.collection("tagging_types").drop();
  await DB.createCollection(db, "tagging_types");

  await db
    .collection("tagging_types")
    .createIndex({ document_id: 1 }, { unique: true });
};

// Generate and insert a given number of documents
inserter.mockDocuments = async (numDocuments) => {
  console.log(`inserting ${numDocuments} mocked documents`);

  // insert documents
  const db = await DB.getDBConnection();
  const batchSize = 100;
  for (let i = 0; i < numDocuments; i += batchSize) {
    const documents = [];
    for (let j = 0; j < batchSize; j++) {
      documents.push(dataMocker.generateOneDocument());
    }
    await DB.insertDocuments(db, "documents", documents);
  }
};

inserter.mockResponsibleTeam = async (numStock) => {
  console.log(`inserting ${numStock} mocked responsible teams`);
  const db = await DB.getDBConnection();
  const batchSize = 1000;
  for (let i = 0; i < numStock; i += batchSize) {
    const teams = [];
    for (let j = 0; j < batchSize; j++) {
      teams.push(dataMocker.generateOneResponsibleTeam());
    }
    await DB.insertDocuments(db, "teams", teams);
  }
};

inserter.mockChecklists = async (numDocuments) => {
  console.log(`inserting ${numDocuments} mocked checklists`);
  const db = await DB.getDBConnection();
  const batchSize = 10;
  for (let i = 0; i < numDocuments; i += batchSize) {
    const matrixEvents = [];
    for (let j = 0; j < batchSize; j++) {
      matrixEvents.push(dataMocker.generateOneChecklist());
    }
    await DB.insertDocuments(db, "checklists", matrixEvents);
  }
};

inserter.mockMatrixEvents = async (numDocuments) => {
  console.log(`inserting ${numDocuments} mocked matrix_events`);
  const db = await DB.getDBConnection();
  const batchSize = 100;
  for (let i = 0; i < numDocuments; i += batchSize) {
    const matrixEvents = [];
    for (let j = 0; j < batchSize; j++) {
      matrixEvents.push(dataMocker.generateOneMatrixEvent());
    }
    await DB.insertDocuments(db, "matrix_events", matrixEvents);
  }
};

inserter.mockEventValues = async (numDocuments) => {
  console.log(`inserting ${numDocuments} mocked event_values`);
  const db = await DB.getDBConnection();
  const numMatrix = 45;
  const numEvents = 2;
  const batchSize = 1000;
  for (let i = 0; i < numDocuments * numMatrix * numEvents; i += batchSize) {
    const eventValues = [];
    for (let j = 0; j < batchSize; j++) {
      eventValues.push(dataMocker.generateOneEventValue());
    }
    await DB.insertDocuments(db, "event_values", eventValues);
  }
};

inserter.mockTaggingTypes = async (numDocuments) => {
  console.log(`inserting ${numDocuments} mocked tagging_types`);
  const db = await DB.getDBConnection();
  const batchSize = 100;
  for (let i = 0; i < numDocuments; i += batchSize) {
    const taggingTypes = [];
    for (let j = 0; j < batchSize; j++) {
      taggingTypes.push(dataMocker.generateOneTaggingType());
    }
    await DB.insertDocuments(db, "tagging_types", taggingTypes);
  }
};

inserter.mockEditHistory = async (numDocuments) => {
  console.log(`inserting ${numDocuments} mocked edit_history`);
  const db = await DB.getDBConnection();
  const batchSize = 1000;
  for (let i = 0; i < numDocuments; i += batchSize) {
    const editHistory = [];
    for (let j = 0; j < batchSize; j++) {
      editHistory.push(dataMocker.generateOneEditHistory());
    }
    await DB.insertDocuments(db, "edit_history", editHistory);
  }
};
