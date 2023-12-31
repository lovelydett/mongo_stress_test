"use strict";

const crypto = require("crypto");

const config = require("../config.json");

const matrixIDs = require("../example_objects/example_matrices.js");
const exampleValue = require("../example_objects/example_calculation_value.js");
const calculationIDs = require("../example_objects/example_calculations.js");
const exampleHighlight = require("../example_objects/example_highlight.js");

module.exports = function generateOneMatrixEvent(documentID) {
  const matrixEvent = {
    document_id: documentID,
    matrices: {},
  };

  for (let matrixID of matrixIDs) {
    matrixEvent.matrices[matrixID] = {
      event_ids: [], // to be completed
      original_values: {}, // to be completed
    };

    // complete event ids
    for (let i = 0; i < config.mock.matrix_events.numEventsPerMatrix; i++) {
      const eventID = documentID + "_" + matrixID + "_" + i;
      matrixEvent.matrices[matrixID].event_ids.push(eventID);
    }

    // complete original values
    matrixEvent.matrices[matrixID].original_values = {};
    for (let calculationID of calculationIDs) {
      const calculationType = matrixID + "_" + calculationID;
      matrixEvent.matrices[matrixID].original_values[calculationID] = {
        calculation_type: calculationType,
        value: JSON.parse(JSON.stringify(exampleValue)), // need to make a hard copy of the exampleValue
        candidates: [],
      };
      matrixEvent.matrices[matrixID].original_values[
        calculationID
      ].value.highlight_id =
        documentID +
        "_" +
        matrixID +
        "_" +
        calculationID +
        "_" +
        crypto.randomUUID();
      for (
        let i = 0;
        i < config.mock.event_values.numCandidatesPerCalculation;
        i++
      ) {
        matrixEvent.matrices[matrixID].original_values[
          calculationID
        ].candidates.push(JSON.parse(JSON.stringify(exampleValue)));
        matrixEvent.matrices[matrixID].original_values[
          calculationID
        ].candidates[i].highlight_id =
          documentID +
          "_" +
          matrixID +
          "_" +
          calculationID +
          "_" +
          crypto.randomUUID();
      }
    }
  }
  return matrixEvent;
};
