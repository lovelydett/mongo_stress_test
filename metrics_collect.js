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
    const stats = await db.stats();
    const indexSize = stats.indexSize;
    return indexSize;
};

const main = async () => {
  const db = await DB.getDBConnection();
  const stats = await db.stats();
  console.log(stats);
  const storageSize = stats.storageSize;
  const indexSize = stats.indexSize;
  console.log(storageSize, indexSize);
};

if (require.main == module) {
    main()
        .catch(console.error)
        .finally(() => process.exit(0));
}
