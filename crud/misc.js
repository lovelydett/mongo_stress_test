/**
 * @fileoverview misc queries reflect typical business processes like first retrieve and then update
 */

"use strict";

const DB = require("../db");
const db = DB.getDBConnection();
const miscTest = {};

miscTest.modifyChecklistScenario = async function () {
  const randomDocument = db
    .collection("documents")
    .aggregate([{ $sample: { size: 1 } }]);

  const documentID = randomDocument.document_id;

  const document = db
    .collection("documents")
    .findOne({ document_id: documentID });
  const checklist = db
    .collection("documents")
    .findOne({ document_id: documentID });
  const highlightIDs = [];
  // get all highlight IDs for each rule one-by-one, this is to simulate browsing and modifying each rule
  for (const ruleID in checklist.rules) {
    const rule = checklist.rules[ruleID];
    highlightIDs.push(...rule.highlight_ids);
    for (const highlightID of rule.highlight_ids) {
      const highlight = await db.collection.findOne({
        highlight_id: highlightID,
      });
      // modify highlight
      highlight.highlight_id = highlight.highlight_id + crypto.randomUUID();
      highlightIDs.push(highlight.highlight_id);
      await DB.insertOneDocument(db, "highlights", highlight);
      // push the new highlight ID into checklist collection
      await db.collection("checklist").updateOne(
        {
          document_id: documentID,
          [`rules.${ruleID}`]: {
            $exists: true,
          },
        },
        {
          $addToSet: {
            [`rules.${ruleID}.highlight_ids`]: highlight.highlight_id,
          },
        }
      );
    }
  }

  // pull all highlights for all rule at once, simulate the "view all highlights"
  const highlights = await db.collection("highlights").find({
    highlight_id: { $in: highlightIDs },
  });

  return;
};
