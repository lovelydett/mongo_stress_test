const config = require("../config.json");

const exampleTaggingTypes = require("../example_objects/example_tagging_type.js");

module.exports = function generateOneTaggingType(documentID) {
  const taggingTypes = {
    document_id: documentID,
    tagging_types: JSON.parse(JSON.stringify(exampleTaggingTypes)),
  };

  const tagging = taggingTypes.tagging_types;
  for (let taggingID in tagging) {
    tagging[taggingID].highlight_ids = [];
    for (
      let i = 0;
      i < config.mock.tagging_types.numHighlightsPerTaggingType;
      i++
    ) {
      const highlightID = documentID + "_" + taggingID + "_" + i;
      tagging[taggingID].highlight_ids.push(highlightID);
    }
  }

  return taggingTypes;
}
