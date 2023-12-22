/**
 * @fileoverview This file is to examine the database metrics
 */

"use strict";

const DB = require("./db");

const main = async () => {
  const db = await DB.getDBConnection();
  const stats = await db.stats();
  const dataSize = stats.dataSize;
  console.log(`The size of the database is ${dataSize} bytes`);

  // get index sizes for each collection
  console.log(stats.indexSizes);
  const collectionNames = [
    "documents",
    "teams",
    "matrix_events",
    "event_values",
    "checklists",
    "tagging_types",
    "edit_history",
  ];
  for (const name of collectionNames) {
    const indexSize = db.collection(name).totalIndexSize;
    console.log(`The size of the index of ${name} is ${indexSize} bytes`);
  }

  const cacheSize =
    db.serverStatus().wiredTiger.cache["bytes currently in the cache"];
  console.log(`The size of the cache is ${cacheSize} bytes`);

  const workingSetSize = dataSize + indexSize;
  console.log(`The size of the working set is ${workingSetSize} bytes`);

  const totalMemoryUsed = db.serverStatus().mem["resident"];
  console.log(`The total memory used is ${totalMemoryUsed} bytes`);

  const totalRequiredMemory = (workingSetSize + cacheSize) * 2.5;
  console.log(`The total required memory is ${totalRequiredMemory} bytes`);
};

main()
  .catch(console.error)
  .finally(() => process.exit(0));
