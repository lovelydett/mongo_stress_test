/**
 * @fileoverview This file contains the queries to be evaluated.
 */

"use strict";

const DB = require("../db");

const crypto = require("crypto");
const moment = require("moment");

/****** Begins the logic of this file ******/

const queryHelper = {};
module.exports = queryHelper;

async function randomSearchDocuments() {
  const db = await DB.getDBConnection();
  const collection = db.collection("documents");
  const result = await collection.find({
    "headline_codes.latest.all": "201",
    available: crypto.randomInt(0, 2) == 0 ? true : false,
    vetting_enabled: crypto.randomInt(0, 2) == 0 ? true : false,
    jura_enabled: crypto.randomInt(0, 2) == 0 ? true : false,
    flagged_by: null,
    number_of_critical_items: { $gte: crypto.randomInt(1, 10) },
    number_of_non_critical_items: { $lte: crypto.randomInt(1, 10) },
    "checklists.contents.checklist": { $exists: true, $ne: [] },
  });

  return result;
}

queryHelper.searchForDocuments = async (numRequests, numThread = 1) => {
  console.log(`Testing searchForDocuments with ${numThread} threads`);
  // we need to create a new connection for each thread
  const startTime = moment();
  const result = await randomSearchDocuments();
  const endTime = moment();
  const duration = moment.duration(endTime.diff(startTime));
  console.log(`The search took ${duration.asSeconds()} seconds`);
};
