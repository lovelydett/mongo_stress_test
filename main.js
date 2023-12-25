/**
 * @fileoverview the main entry of the stress test
 * @author Yuting Xie
 * @date 25/12/2023
 */

"use strict";

const { initer, inserter } = require("./insert_mocking_data");
const metricsCollector = require("./metrics_collect");

const cmdParser = require("command-line-parser");
const fs = require("fs");

/****** Begins the logic of this file ******/

async function main() {
  const args = cmdParser();
  if (args["init"]) {
    await initer.initDocuments();
    await initer.initResponsibleTeam();
    await initer.initMatrixEvents();
    await initer.initEventValues();
    await initer.initChecklists();
    await initer.initTaggingTypes();
    await initer.initEditHistory();
    console.log("Done");
    process.exit(0);
  }

  const fout = fs.createWriteStream("result/result.csv");
  fout.write(
    "num_documents, data_size, index_size, cache_size, working_set_size, total_memory_used, total_required_memory\n"
  );

  await inserter.mockResponsibleTeam(3000);
  for (let numDocuments = 100; numDocuments <= 1500; numDocuments += 100) {
    await inserter.mockDocuments(numDocuments);
    await inserter.mockChecklists(numDocuments);
    await inserter.mockMatrixEvents(numDocuments);
    await inserter.mockEventValues(numDocuments);
    await inserter.mockEditHistory(numDocuments);
    await inserter.mockTaggingTypes(numDocuments);
    // collect metrics
    const dataSize = await metricsCollector.getTotalSize();
    const indexSize = await metricsCollector.getIndexSize();
    fout.write(`${numDocuments}, ${dataSize}, ${indexSize}, \n`);
    console.log(`${numDocuments}, ${dataSize}, ${indexSize}`);
  }

  console.log("Done");
  process.exit(0);
}

main().catch(console.error);
