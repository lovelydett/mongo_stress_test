"use strict";

const DB = require("../db");
const db = DB.getDBConnection();
const config = require("../config.json");

const crypto = require("crypto");

const generateOneDocument = require("../data_generators/documents.js");
const generateOneChecklist = require("../data_generators/checklists.js");
const generateOneMatrixEvent = require("../data_generators/matrix_events.js");
const generateEventValues = require("../data_generators/event_values.js");
const generateOneHighlight = require("../data_generators/highlights.js");
const generateOneTaggingTypes = require("../data_generators/tagging_types.js");
const generateOneEditHistory = require("../data_generators/edit_history.js");
const { promises } = require("dns");

let document = null;
let checklist = null;
let matrixEvent = null;
let eventValues = null;
let highlights = null;
let taggingTypes = null;
let editHistory = null;

let inited = false;

function generateData() {
  document = generateOneDocument();
  checklist = generateOneChecklist(document.document_id);
  matrixEvent = generateOneMatrixEvent(document.document_id);
  eventValues = generateEventValues(matrixEvent);
  for (let i = 0; i < config.mock.checklists.numHighlightsPerRule; i++) {
    const highlight = generateOneHighlight(document.document_id);
    highlights.push(highlight);
  }
  taggingTypes = generateOneTaggingTypes(document.document_id);
}
generateData();

const insertTest = {};
module.exports = insertTest;

insertTest.insertOneEvent = async () => {
  eventValues[0].document_id = crypto.randomUUID();
  await DB.insertOneDocument(db, "event_values", eventValues[0]);
};

insertTest.insertOneDocumentAndRelated = async () => {
  generateData();
  const promises = [];
  promises.push(DB.insertOneDocument(db, "documents", document));
  promises.push(DB.insertOneDocument(db, "checklists", checklist));
  promises.push(DB.insertOneDocument(db, "matrix_events", matrixEvent));
  promises.push(DB.insertDocuments(db, "event_values", eventValues));
  promises.push(DB.insertDocuments(db, "highlights", highlights));
  promises.push(DB.insertOneDocument(db, "tagging_types", taggingTypes));
  promises.push(DB.insertOneDocument(db, "edit_history", editHistory));
  await Promise.all(promises);
};
