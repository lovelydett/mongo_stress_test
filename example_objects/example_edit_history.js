const config = require("../config.json");

const crypto = require("crypto");
const moment = require("moment");

const exampleEdits = [];

module.exports = exampleEdits;

function generateExampleEditHistory() {
  if (exampleEdits.length > 0) {
    return;
  }

  for (let i = 0; i < config.mock.edit_history.numEditsPerDocument; i++) {
    const edit = {
      user: crypto.randomUUID(),
      timestamp: moment().format("YYYY-MM-DDThh:mm:ssZ"),
      modified: crypto.randomUUID(),
      before: crypto.randomBytes(500).toString("hex"),
      after: crypto.randomBytes(500).toString("hex"),
    };
    exampleEdits.push(edit);
  }
}

generateExampleEditHistory();
