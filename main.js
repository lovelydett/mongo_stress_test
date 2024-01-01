/**
 * @fileoverview the main entry of the stress test
 * @author Yuting Xie
 * @date 25/12/2023
 */

"use strict";

const { initer, inserter } = require("./mock_data");
const queryHelper = require("./crud_tests/queries");
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
    await initer.initHighlights();
  } else if (args["mock"]) {
    const fout = fs.createWriteStream("result/result.csv");
    fout.write(
      "num_documents, data_size, index_size, cache_size, working_set_size, total_memory_used, total_required_memory\n"
    );

    await inserter.mockResponsibleTeam(3000);
    const deltaNumbers = 100;
    const totalNumbers = 10000;
    for (let inserted = 0; inserted <= totalNumbers; inserted += deltaNumbers) {
      await inserter.mockDocuments(deltaNumbers);
      await inserter.mockChecklists(deltaNumbers);
      await inserter.mockMatrixEvents(deltaNumbers);
      await inserter.mockEventValues(deltaNumbers);
      await inserter.mockEditHistory(deltaNumbers);
      await inserter.mockTaggingTypes(deltaNumbers);
      // collect metrics
      const dataSize = await metricsCollector.getTotalSize();
      const indexSize = await metricsCollector.getIndexSize();
      fout.write(`${inserted + deltaNumbers}, ${dataSize}, ${indexSize}, \n`);
      console.log(`${inserted + deltaNumbers}, ${dataSize}, ${indexSize}`);
    }
  } else if (args["query"]) {
    const fout = fs.createWriteStream("result/query_result.csv");
    fout.write(
      "test_name, num_requests, num_threads, avg_latency, max_latency, min_latency\n"
    );
    const numRequests = 4;
    for (let i = 2; i <= 80; i += 2) {
      const result = await queryHelper.execTest(
        "search_documents",
        numRequests,
        i
      );
      // sleep for 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10000));
      fout.write(
        `search_documents, ${numRequests}, ${i}, ${result.avgLatency}, ${result.maxLatency}, ${result.minLatency}\n`
      );
    }
  }

  console.log("Done");
  process.exit(0);
}

main().catch(console.error);
