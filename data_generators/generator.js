/**
 * @fileoverview the generator of this
 */

"use strict";

const config = require("../config.json");

const DB = require("../db.js");

/****** Begins the logic of this file ******/

const dataGenerator = {};
module.exports = dataGenerator;

const generateOneDocument = require("./documents.js");
const generateOneChecklist = require("./checklists.js");
const generateOneMatrixEvent = require("./matrix_events.js");
const generateEventValues = require("./event_values.js");
const generateOneHighlight = require("./highlights.js");

function collectHighlightIDsFromChecklist(checklist) {
  const highlightIDs = [];
  for (let ruleID in checklist.rules) {
    // copy all highlight_ids into highlightIDs
    highlightIDs.push(...checklist.rules[ruleID].highlight_ids);
  }

  return highlightIDs;
}

function collectHighlightIDsFromEventValue(eventValue) {
  const highlightIDs = [];
  const values = eventValue.values;
  for (let calculationID in values) {
    highlightIDs.push(values[calculationID].highlight_id);
    highlightIDs.push(
      ...values[calculationID].candidates.map((c) => c.highlight_id)
    );
  }

  return highlightIDs;
}

dataGenerator.generateOneDocumentAndRelatedData = async function () {
  const db = await DB.getDBConnection();
  const promises = [];

  // 1. generate a document
  const document = generateOneDocument();
  // promises.push(DB.insertDocuments(db, "documents", [document]));

  // 2. generate the checklist of this document
  const checklist = generateOneChecklist(document.document_id);
  console.log(checklist);
  promises.push(DB.insertDocuments(db, "checklists", [checklist]));

  // 3. generate the matrix event of this document
  const matrixEvent = generateOneMatrixEvent(document.document_id);
  // promises.push(DB.insertDocuments(db, "matrix_events", [matrixEvent]));

  // 4. generate the event values of this matrix event
  const eventValues = generateEventValues(matrixEvent);
  // promises.push(DB.insertDocuments(db, "event_values", eventValues));

  // 5. get highlights for checklist
  const highlights = [];
  const checklistHighlights = collectHighlightIDsFromChecklist(checklist);
  highlights.push(...checklistHighlights);

  // 6. get highlights for event values
  for (let eventValue of eventValues) {
    const eventValueHighlights = collectHighlightIDsFromEventValue(eventValue);
    highlights.push(...eventValueHighlights);
  }

  // TODO: 7. get highlights for tagging types

  console.log(highlights);
};

/****** test ******/
if (require.main === module) {
  dataGenerator.generateOneDocumentAndRelatedData().catch((err) => {
    console.log(err);
  });
}
