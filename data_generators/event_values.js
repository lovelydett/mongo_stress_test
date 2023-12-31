"use strict";

const crypto = require("crypto");

function generateEventValues(matrixEvent) {
  const eventValues = [];
  const matrices = matrixEvent.matrices;
  console.log(matrixEvent.event_ids);
  for (let matrixID in matrices) {
    for (let eventID of matrices[matrixID].event_ids) {
      const values = JSON.parse(
        JSON.stringify(matrices[matrixID].original_values)
      );
      // switch all highlight objects to highlight id
      for (let calculationID in values) {
        delete values[calculationID].highlight;
        values[calculationID].highlight_id =
          matrixEvent.document_id +
          "_" +
          matrixID +
          "_" +
          calculationID +
          "_" +
          crypto.randomUUID();
        for (let candidate of values[calculationID].candidates) {
          delete candidate.highlight;
          candidate.highlight_id =
            matrixEvent.document_id +
            "_" +
            matrixID +
            "_" +
            calculationID +
            "_" +
            crypto.randomUUID();
        }
      }

      // now we have the values for this event
      eventValues.push({
        event_id: eventID,
        values: values,
      });
    }
  }

  return eventValues;
}

module.exports = generateEventValues;

/****** test ******/

if (require.main === module) {
  const generateOneMatrixEvent = require("./matrix_events.js");
  const matrixEvent = generateOneMatrixEvent("document_1");
  const eventValues = generateEventValues(matrixEvent);
  console.log(eventValues[0]);
  const fs = require("fs");
  fs.writeFileSync(
    "example_event_values.json",
    JSON.stringify(eventValues[0], null, 2)
  );
}
