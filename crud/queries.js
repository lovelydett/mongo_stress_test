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

const testNameToFunction = new Map();

testNameToFunction["empty_search"] = async () => {
  const db = await DB.getDBConnection(true);
  const collection = db.collection("documents");
  // find 10 documents
  const result = await collection.find({}).limit(10);
  return result;
};

testNameToFunction["search_documents"] = async () => {
  const db = await DB.getDBConnection(true);
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

queryHelper.execTest = async (testName, numRequests, numThreads = 1) => {
  console.log(`executing ${testName} with ${numThreads} threads`);
  let totalDuration = 0;
  let maxDuration = Number.MIN_SAFE_INTEGER;
  let minDuration = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < numRequests; i++) {
    const promises = [];
    for (let j = 0; j < numThreads; j++) {
      promises.push(
        (async () => {
          const startTime = moment();
          await testNameToFunction[testName]();
          const endTime = moment();
          const duration = moment.duration(endTime.diff(startTime));
          totalDuration += duration.asMilliseconds();
          maxDuration = Math.max(maxDuration, duration.asMilliseconds());
          minDuration = Math.min(minDuration, duration.asMilliseconds());
        })()
      );
    }
    await Promise.all(promises);
    // sleep for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  // eliminate the max and the min
  totalDuration -= maxDuration;
  totalDuration -= minDuration;
  const averageDuration = totalDuration / (numRequests * numThreads - 2);
  console.log(
    `the ${testName} executed ${numRequests} times ${numThreads} threads: avg latency: ${averageDuration} ms, max latency: ${maxDuration} ms, min latency: ${minDuration} ms`
  );

  return {
    avgLatency: averageDuration,
    maxLatency: maxDuration,
    minLatency: minDuration,
  };
};

async function main() {
  const result = await testNameToFunction["empty_search"]();
  console.log(await result.toArray());
  process.exit(0);
}

if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => process.exit(0));
}
