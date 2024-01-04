/**
 * @fileoverview the uniform logic of CRUD performance tests
 */

const moment = require("moment");
const fs = require("fs");

const queryTest = require("./query");
const insertTest = require("./insert");
const miscTest = require("./misc");

const tests = {
  query: queryTest,
  insert: insertTest,
  misc: miscTest,
};

async function execTestOnce(testName) {
  const startTime = moment();
  const test = tests[testName];
  await test();
  const endTime = moment();
  const duration = moment.duration(endTime.diff(startTime));
  return duration.asMilliseconds();
}

module.exports = async function (testName, numThreads, numRounds) {
  if (!tests.hasOwnProperty(testName)) {
    throw new Error(`Test ${testName} not found`);
  }
  console.log(
    `executing ${testName} with ${numThreads} threads for ${numRounds} rounds`
  );
  const timeStr = moment().format("YYYY-MM-DD-HH-mm-ss");
  const resultFileName = `result/crud_test/${testName}_${numThreads}_${numRounds}_${timeStr}.csv`;
  // create the result dir
  if (!fs.existsSync("result/crud_test")) {
    fs.mkdirSync("result/crud_test");
  }
  const fout = fs.createWriteStream(resultFileName);
  fout.write(
    "num_threads, num_requests, avg_latency, max_latency, min_latency\n"
  );
  let totalDuration = 0;
  let maxDuration = Number.MIN_SAFE_INTEGER;
  let minDuration = Number.MAX_SAFE_INTEGER;
  for (let nThread = 2; nThread <= numThreads; nThread += 2) {
    for (let i = 0; i < numRounds; i++) {
      const promises = [];
      for (let j = 0; j < nThread; j++) {
        promises.push(
          (async () => {
            const duration = await execTestOnce(testName);
            totalDuration += duration;
            maxDuration = Math.max(maxDuration, duration);
            minDuration = Math.min(minDuration, duration);
          })()
        );
      }
      await Promise.all(promises);
    }
  }
  // eliminate the max and the min
  totalDuration -= maxDuration;
  totalDuration -= minDuration;
  const averageDuration = totalDuration / (numRounds * numThreads - 2);
  console.log(
    `the ${testName} executed ${numRounds} times ${numThreads} threads: avg latency: ${averageDuration} ms, max latency: ${maxDuration} ms, min latency: ${minDuration} ms`
  );
  fout.write(
    `${numThreads}, ${numRounds}, ${averageDuration}, ${maxDuration}, ${minDuration}\n`
  );
  fout.close();
};
