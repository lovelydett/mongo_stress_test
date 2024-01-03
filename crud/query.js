/**
 * @fileoverview mock query stress tests
 */

"use strict";

const DB = require("../db");

const queryTest = {};

queryTest.searchForDocuments = async function () {
  const db = DB.getDBConnection();
  const collection = db.collection("documents");
  const result = await collection.find({
    "headline_codes.latest.all": { $ne: "201" },
    available: crypto.randomInt(0, 2) == 0 ? true : false,
    vetting_enabled: crypto.randomInt(0, 2) == 0 ? true : false,
    jura_enabled: crypto.randomInt(0, 2) == 0 ? true : false,
    flagged_by: null,
    number_of_critical_items: { $gte: crypto.randomInt(1, 10) },
    number_of_non_critical_items: { $lte: crypto.randomInt(1, 10) },
    "checklists.contents.checklist": { $exists: true, $ne: [] },
  });
  return result;
};
