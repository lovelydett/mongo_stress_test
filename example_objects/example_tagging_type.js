const config = require("../config.json");

const exampleTaggingTypes = {};

module.exports = exampleTaggingTypes;

function generateExampleTaggingTypes() {
  if (Object.keys(exampleTaggingTypes).length > 0) {
    return;
  }

  for (
    let i = 0;
    i < config.mock.tagging_types.numTaggingTypesPerDocument;
    i++
  ) {
    exampleTaggingTypes["tagging_type_" + i] = {
      highlight_ids: [],
    };
  }
}

generateExampleTaggingTypes();
