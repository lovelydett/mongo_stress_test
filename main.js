/**
 * @fileoverview the main entry of the stress test
 * @author Yuting Xie
 * @date 25/12/2023
 */

"use strict";

const { initer, inserter } = require("./mock_data");
const queryHelper = require("./crud_tests/queries");
const metricsCollector = require("./metrics_collect");
const config = require("./config.json");
const generator = require("./data_generators/generator");

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
  } else {
    const fout = fs.createWriteStream("result/result.csv");
    fout.write(
      "toal_documents, vettable_documents, data_size, index_size, cache_size, working_set_size, total_memory_used, total_required_memory\n"
    );

    await inserter.mockResponsibleTeam(3000);
    const numVettable = 0;
    for (let i = 1; i <= config.mock.documents.numTotal; i++) {
      const hasRelatedData = Math.random() < Number(config.mock.documents.ratioVettable);
      if (hasRelatedData) {
        numVettable++;
      }
      await generator.generateOneDocumentAndRelatedData(hasRelatedData);
      if (i % config.mock.documents.checkPointInterval === 0) {
        // collect metrics
        const dataSize = await metricsCollector.getTotalSize();
        const indexSize = await metricsCollector.getIndexSize();
        fout.write(`${i}, ${numVettable}, ${dataSize}, ${indexSize}, \n`);
        console.log(`${i}, ${numVettable}, ${dataSize}, ${indexSize}`);
      }
    }
  }

  console.log("Done");
  process.exit(0);
}

main().catch(console.error);
