"use strict";

const moment = require("moment");

const config = require("../config.json");
const ruleIDs = require("../example_objects/example_rules.js");
const exampleHighlight = require("../example_objects/example_highlight.js");

function generateOneChecklist(document_id) {
  const checklist = {};

  checklist.document_id = document_id;

  // random pick a time between 2018-01-01 and 2020-01-01
  checklist.update_time = moment(
    Math.random() * (1577836800000 - 1514764800000) + 1514764800000
  ).format("YYYY-MM-DDTHH:mm:ssZ");

  checklist.rules = {};
  for (let ruleID of ruleIDs) {
    checklist.rules[ruleID] = {
      is_disclosed: {
        original: Math.random() < 0.5,
        latest: Math.random() < 0.5,
      },
      headline_codes: {
        include: [2010606, 2010607],
        exclude: [2010603],
      },
      highlight_ids: [], // to be completed,
      original_highlight_ids: [], // to be completed
    };

    // complete highlight ids
    for (let i = 0; i < config.mock.checklists.numHighlightsPerRule; i++) {
      const highlightID = document_id + "_" + ruleID + "_" + i;
      checklist.rules[ruleID].highlight_ids.push(highlightID);
    }

    // complete original highlight ids
    for (let i = 0; i < config.mock.checklists.numHighlightsPerRule; i++) {
      const highlightID = document_id + "_" + ruleID + "_" + (i + checklist.rules[ruleID].highlight_ids.length);
      checklist.rules[ruleID].original_highlight_ids.push(highlightID);
    }
  }

  return checklist;
}

module.exports = generateOneChecklist;

/****** test below ******/

if (require.main === module) {
  const mockedData = generateOneChecklist("document_id");
  console.log(mockedData);
}
