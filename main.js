/**
 * @fileoverview the main entry of the stress test
 * @author Yuting Xie
 * @date 25/12/2023
 */

"use strict";

const {initer, inserter} = require("./insert_mocking_data");
const cmdParser = require("command-line-parser");


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
    
    await inserter.mockResponsibleTeam(3000);
    for (let i = 1000; i <= 15000; i += 1000) {
        await inserter.mockDocuments(numDocuments);
        await inserter.mockChecklists(numDocuments);
        await inserter.mockMatrixEvents(numDocuments);
        await inserter.mockEventValues(numDocuments);
        await inserter.mockEditHistory(numDocuments);
        await inserter.mockTaggingTypes(numDocuments);
    }

    console.log("Done");
    process.exit(0);
}
  
main().catch(console.error);