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
const generateOneTaggingTypes = require("./tagging_types.js");

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

function collectHighlightIDsFromTaggingTypes(taggingTypes) {
  const highlightIDs = [];
  const tagging = taggingTypes.tagging_types;
  for (let taggingID in tagging) {
    highlightIDs.push(...tagging[taggingID].highlight_ids);
  }

  return highlightIDs;
}

async function generateHighlightsInBatch(highlightIDs) {
  const batchSize = 200;
  const db = await DB.getDBConnection();
  while (highlightIDs.length > 0) {
    const highlights = [];
    for (let i = 0; i < batchSize && highlightIDs.length > 0; i++) {
      const highlight = generateOneHighlight(highlightIDs.pop());
      highlights.push(highlight);
    }
    await DB.insertDocuments(db, "highlights", highlights);
  }
}

// batching documents of same collection
const batchSize = 200;
const documents = [];
const checklists = [];
const matrixEvents = [];
const taggingTypes = [];
dataGenerator.generateOneDocumentAndRelatedData = async function (
  hasRelatedData
) {
  const db = await DB.getDBConnection();
  const promises = [];

  // 1. generate a document
  const document = generateOneDocument();
  documents.push(document);
  if (documents.length >= batchSize) {
    promises.push(DB.insertDocuments(db, "documents", documents));
    documents.length = 0;
  }

  if (!hasRelatedData) {
    await Promise.all(promises);
    return;
  }

  // 2. generate the checklist of this document
  const checklist = generateOneChecklist(document.document_id);
  checklists.push(checklist);
  if (checklists.length >= batchSize) {
    promises.push(DB.insertDocuments(db, "checklists", checklists));
    checklists.length = 0;
  }

  // 3. generate the matrix event of this document
  const matrixEvent = generateOneMatrixEvent(document.document_id);
  matrixEvents.push(matrixEvent);
  if (matrixEvents.length >= batchSize) {
    promises.push(DB.insertDocuments(db, "matrix_events", matrixEvents));
    matrixEvents.length = 0;
  }

  // 4. generate the event values of this matrix event
  const eventValues = generateEventValues(matrixEvent);
  promises.push(DB.insertDocuments(db, "event_values", eventValues));

  // 5. generate the tagging types of this document
  const taggingType = generateOneTaggingTypes(document.document_id);
  taggingTypes.push(taggingType);
  if (taggingTypes.length >= batchSize) {
    promises.push(DB.insertDocuments(db, "tagging_types", taggingTypes));
    taggingTypes.length = 0;
  }

  // 6. get highlights for checklist
  const highlightIDs = [];
  const checklistHighlights = collectHighlightIDsFromChecklist(checklist);
  highlightIDs.push(...checklistHighlights);

  // 7. get highlights for event values
  for (let eventValue of eventValues) {
    const eventValueHighlights = collectHighlightIDsFromEventValue(eventValue);
    highlightIDs.push(...eventValueHighlights);
  }

  // 8. get highlights for tagging types
  const taggingTypesHighlights =
    collectHighlightIDsFromTaggingTypes(taggingTypes);
  highlightIDs.push(...taggingTypesHighlights);

  // 9. insert highlight objects into db
  await generateHighlightsInBatch(highlightIDs);

  await Promise.all(promises);
};

/****** test ******/
if (require.main === module) {
  dataGenerator.generateOneDocumentAndRelatedData().catch((err) => {
    console.log(err);
  });
}
