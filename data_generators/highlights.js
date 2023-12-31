"use strict";

const exampleHighlight = require("../example_objects/example_highlight.js");

module.exports = function generateOneHighlight(highlightID) {
  const highlight = JSON.parse(JSON.stringify(exampleHighlight));
  highlight.highlight_id = highlightID;
  return highlight;
};
