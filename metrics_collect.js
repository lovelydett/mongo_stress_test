/**
 * @fileoverview This file contains the functions to collect metrics from the MongoDB cluster
 */

"use strict";

const { model } = require("mongoose");
const DB = require("./db");

/****** Begins the logic of this file ******/

const metricsCollector = {};
module.exports = metricsCollector;

metricsCollector.getTotalSize = async () => {
  const db = await DB.getDBConnection();
  const stats = await db.stats();
  const dataSize = stats.dataSize;
  return dataSize;
};

metricsCollector.getIndexSize = async () => {
  const db = await DB.getDBConnection();
  const collectionNames = [
    "documents",
    "teams",
    "matrix_events",
    "event_values",
    "checklists",
    "tagging_types",
    "edit_history",
  ];
  let indexSize = 0;
  for (const name of collectionNames) {
    indexSize += db.collection(name).totalIndexSize;
  }
  return indexSize;
};
