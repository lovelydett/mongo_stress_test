"use strict";

const config = require("../config.json");

const exampleEdits = require("../example_objects/example_edit_history.js");

module.exports = function generateOneEditHistory(documentID) {
  const editHistory = {
    document_id: documentID,
    edits: exampleEdits,
  };
  return editHistory;
};
