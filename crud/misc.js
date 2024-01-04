/**
 * @fileoverview misc queries reflect typical business processes like first retrieve and then update
 */

"use strict";

const DB = require("../db");

module.exports = async function () {
  const db = await DB.getDBConnection();
  const documentsCollection = db.collection("documents");
  const checklistCollection = db.collection("checklists");
  const highlightsCollection = db.collection("highlights");
  let res = await documentsCollection
    .aggregate([{ $sample: { size: 1 } }])
    .toArray();
  const randomDocument = res[0];

  const documentID = randomDocument.document_id;

  const document = await documentsCollection.findOne({
    document_id: documentID,
  });
  if (!document) {
    throw new Error(`document ${documentID} not found`);
  }
  const checklist = await checklistCollection.findOne({
    document_id: documentID,
  });
  if (!checklist) {
    throw new Error(`checklist ${documentID} not found`);
  }
  const highlightIDs = [];
  // get all highlight IDs for each rule one-by-one, this is to simulate browsing and modifying each rule
  for (const ruleID in checklist.rules) {
    const rule = checklist.rules[ruleID];
    highlightIDs.push(...rule.highlight_ids);
    for (const highlightID of rule.highlight_ids) {
      res = await documentsCollection
        .findOne({
          highlight_id: highlightID,
        })
        .toArray();
      const highlight = res[0];
      // modify highlight
      highlight.highlight_id = highlight.highlight_id + crypto.randomUUID();
      highlightIDs.push(highlight.highlight_id);
      await DB.insertOneDocument(db, "highlights", highlight);
      // push the new highlight ID into checklist collection
      await checklistCollection.updateOne(
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
