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
const generateOneEditHistory = require("./edit_history.js");

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
const batchSize = 50;
const documents = [];
const checklists = [];
const matrixEvents = [];
const taggingTypes = [];
const editHistories = [];
dataGenerator.generateOneDocumentAndRelatedData = async function (
  hasRelatedData
) {
  const db = await DB.getDBConnection();
  const promises = [];

  // 1. generate a document
  const document = generateOneDocument();
  documents.push(document);
  if (documents.length >= batchSize) {
    const documentsCopy = JSON.parse(JSON.stringify(documents));
    promises.push(DB.insertDocuments(db, "documents", documentsCopy));
    documents.length = 0;
  }

  if (!hasRelatedData) {
    document.vetting_enabled = false;
    await Promise.all(promises);
    return;
  }

  document.vetting_enabled = true;

  // 2. generate the checklist of this document
  const checklist = generateOneChecklist(document.document_id);
  checklists.push(checklist);
  if (checklists.length >= batchSize) {
    const checklistsCopy = JSON.parse(JSON.stringify(checklists));
    promises.push(DB.insertDocuments(db, "checklists", checklistsCopy));
    checklists.length = 0;
  }

  // 3. generate the matrix event of this document
  const matrixEvent = generateOneMatrixEvent(document.document_id);
  matrixEvents.push(matrixEvent);
  if (matrixEvents.length >= batchSize) {
    const matrixEventsCopy = JSON.parse(JSON.stringify(matrixEvents));
    promises.push(DB.insertDocuments(db, "matrix_events", matrixEventsCopy));
    matrixEvents.length = 0;
  }

  // 4. generate the event values of this matrix event
  const eventValues = generateEventValues(matrixEvent);
  promises.push(DB.insertDocuments(db, "event_values", eventValues));

  // 5. generate the tagging types of this document
  const taggingType = generateOneTaggingTypes(document.document_id);
  taggingTypes.push(taggingType);
  if (taggingTypes.length >= batchSize) {
    const taggingTypesCopy = JSON.parse(JSON.stringify(taggingTypes));
    promises.push(DB.insertDocuments(db, "tagging_types", taggingTypesCopy));
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
  promises.push(generateHighlightsInBatch(highlightIDs));

  // 10. generate edit history
  const editHistory = generateOneEditHistory(document.document_id);
  editHistories.push(editHistory);
  if (editHistories.length >= batchSize) {
    const editHistoriesCopy = JSON.parse(JSON.stringify(editHistories));
    promises.push(DB.insertDocuments(db, "edit_history", editHistoriesCopy));
    editHistories.length = 0;
  }

  await Promise.all(promises);
};

/****** test ******/
if (require.main === module) {
  dataGenerator.generateOneDocumentAndRelatedData().catch((err) => {
    console.log(err);
  });
}
