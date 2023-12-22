/**
 * @fileoverview This file is to create mocking data for testing.
 */

"use strict";

const DB = require("./db");
const crypto = require("crypto"); // for randomUUID
const moment = require("moment");

const exampleHighlight = require("./example_highlight");
const exampleMatrixEvent = require("./example_matrix_events");

// some config
const NUMBER_DOCUMENTS = 150000000;

// collection initializers
async function initDocuments() {
  console.log("initializing documents");
  // Step1: create the "documents" collection, if exists, drop it
  const db = await DB.getDBConnection();
  await db.collection("documents").drop();
  await DB.createCollection(db, "documents");

  // Step2: create indices
  await db
    .collection("documents")
    .createIndex({ document_id: 1 }, { unique: true });
  await db.collection("documents").createIndex({ available: 1 });
  await db
    .collection("documents")
    .createIndex({ "headline_codes.latest.all": 1 });
  await db.collection("documents").createIndex({ release_time: 1 });
  await db.collection("documents").createIndex({ stock_code: 1 });
  await db.collection("documents").createIndex({ stock_short_name: 1 });
  await db.collection("documents").createIndex({ vetting_enabled: 1 });
  await db.collection("documents").createIndex({ jura_enabled: 1 });
  await db.collection("documents").createIndex({ flagged_by: 1 });
  await db.collection("documents").createIndex({ number_of_critical_items: 1 });
  await db.collection("documents").createIndex({
    number_of_non_critical_items: 1,
  });
  await db
    .collection("documents")
    .createIndex({ "checklists.contents.checklist": 1 });
  await db.collection("documents").createIndex({ filing_title: 1 });
  console.log("documents initialized");
}

async function initResponsibleTeam() {
  console.log("initializing responsible team");
  // Step1: create the "teams" collection, if exists, drop it
  const db = await DB.getDBConnection();
  await db.collection("teams").drop();
  await DB.createCollection(db, "teams");

  // Step2: create indices
  await db.collection("teams").createIndex({ stock_code: 1 }, { unique: true });
  console.log("responsible team initialized");
}

async function initChecklists() {
  console.log("initializing checklists");
  const db = await DB.getDBConnection();
  await db.collection("checklists").drop();
  await DB.createCollection(db, "checklists");

  await db
    .collection("checklists")
    .createIndex({ document_id: 1 }, { unique: true });
  console.log("checklists initialized");
}

async function initMatrixEvents() {
  console.log("initializing matrix_events");
  const db = await DB.getDBConnection();
  await db.collection("matrix_events").drop();
  await DB.createCollection(db, "matrix_events");

  await db
    .collection("matrix_events")
    .createIndex({ document_id: 1 }, { unique: true });
  console.log("matrix_events initialized");
}

async function initTaggingTypes() {
  console.log("initializing tagging_types");
  const db = await DB.getDBConnection();
  await db.collection("tagging_types").drop();
  await DB.createCollection(db, "tagging_types");

  await db
    .collection("tagging_types")
    .createIndex({ document_id: 1 }, { unique: true });
}

// Generate and insert a given number of documents
async function mockDocuments(totalSize) {
  console.log(`Mocking ${totalSize} documents`);
  const generateOneDocument = () => {
    let document = {};

    // 1. random id
    document.document_id = crypto.randomUUID();

    // 2. random available
    document.available = Math.random() < 0.5;

    // 3. 30% vetting_enabled
    document.vetting_enabled = Math.random() < 0.3;

    // 4&5. 20% jura enabled
    const is_jura = Math.random() < 0.2;
    document.jura_enabled = is_jura;
    if (is_jura) {
      document.jura_link = "xxxxxxxx.xxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxx";
    }
    // 6. release time random between 2018-11-23 and 2023-11-23
    const start = moment("2018-11-23");
    const end = moment("2023-11-23");
    const diff = end.diff(start);
    const randomDiff = Math.floor(Math.random() * diff);
    const randomDate = start.add(randomDiff, "ms");
    document.release_time = randomDate.format("YYYY-MM-DDThh:mm:ssZ");

    // 7. random gekko id compony between 110000001157 and 120000001157
    const gekkoId = 110000001157 + Math.floor(Math.random() * 10000000000);
    document.gekko_id = gekkoId.toString();

    // 8. random stock code between 10000 and 13000
    const stockCode = 10000 + Math.floor(Math.random() * 20000);
    document.stock_code = stockCode.toString();

    // 9. 30% delisted
    document.is_delisted = Math.random() < 0.3;

    // 10. random short name between 5 and 10 characters
    const shortNameLength = 5 + Math.floor(Math.random() * 6);
    document.short_name = crypto.randomBytes(shortNameLength).toString("hex");

    // 11. random hkex code id between 0 and 20000
    const hkexCodeId = Math.floor(Math.random() * 20000);
    document.hkex_code_id = hkexCodeId.toString();

    // 12. filing title from one of the following
    const titles = [
      "TRADING HALT",
      "Transaction in own shares",
      "WHITE FORM OF SHARE OFFER ACCEPTANCE AND TRANSFER OF ORDINARY SHARE(S) OF IRC LIMITED",
      "PINK FORM OF OPTION OFFER ACCEPTANCE AND CANCELLATION OF SHARE OPTIONS ISSUED BY IRC LIMITED",
      "COMPOSITE DOCUMENT RELATING TO MANDATORY CONDITIONAL CASH OFFERS BY FIRST FIDELITY CAPITAL (INTERNATIONAL) LIMITED FOR AND ON BEHALF OF AXIOMA CAPITAL FZE LLC TO ACQUIRE ALL THE ISSUED SHARES OF IRC LIMITED (OTHER THAN THOSE ALREADY OWNED AND/OR AGREED TO BE ACQUIRED BY AXIOMA CAPITAL FZE LLC AND PARTIES ACTING IN CONCERT WITH IT) AND TO CANCEL ALL THE OUTSTANDING SHARE OPTIONS OF IRC LIMITED",
      "NOTICE OF COURT MEETING",
      "FORM OF PROXY FOR EXTRAORDINARY GENERAL MEETING",
      "JOINT ANNOUNCEMENT DESPATCH OF SCHEME DOCUMENT RELATING TO (1) PROPOSAL FOR THE PRIVATISATION OF PINE CARE GROUP LIMITED BY THE OFFEROR BY WAY OF A SCHEME OF ARRANGEMENT UNDER SECTION 86 OF THE COMPANIES ACT (2) PROPOSED WITHDRAWAL OF LISTING OF PINE CARE GROUP LIMITED",
      "MAJOR TRANSACTION ACQUISITION OF THE ENTIRE ISSUED SHARE CAPITAL IN THE TARGET COMPANY INVOLVING ISSUE OF INITIAL CONSIDERATION SHARES UNDER GENERAL MANDATE",
    ];
    const titleIndex = Math.floor(Math.random() * titles.length);
    document.filing_title = titles[titleIndex];

    // 13. filing maintype from one of the following
    const maintypes = [
      "Announcements and Notices",
      "Circulars",
      "Listing Documents",
      "Financial Statements/ESG Information",
      "Monthly Returns",
      "Next Day Disclosure Returns",
      "Regulatory Announcement & News",
    ];
    const maintypeIndex = Math.floor(Math.random() * maintypes.length);
    document.filing_maintype = maintypes[maintypeIndex];

    // 14. headline codes
    document.headline_codes = {
      original: ["2010606", "2010811", "2010602", "2010815"],
      latest: {
        all: ["201", "20106", "2010606", "2010602"],
        all_upmost: ["2010606", "2010602"],
      },
    };

    // 15. hkex_file_id random between "2018111500129" and "2023112300129"
    const startInt = 2018111500129;
    const endInt = 2023112300129;
    const randomInt =
      startInt + Math.floor(Math.random() * (endInt - startInt));
    document.hkex_file_id = randomInt.toString();

    // 16. hkex_link
    document.hkex_link =
      "https://www1.hkexnews.hk/listedco/listconews/gem/2023/1115/2023111500129.pdf";

    // 17. storage link
    document.storage_link = "00001/2023111500129.pdf";

    // 18. read by
    document.read_by = [
      "Araminta",
      "Arden",
      "Azalea",
      "Birdie",
      "Blythe",
      "Clover",
      "Lilac",
      "Lavender",
      "Posey",
    ];

    // 19. flagged by, a random number of people
    document.flagged_by = [
      "Araminta",
      "Arden",
      "Azalea",
      "Birdie",
      "Blythe",
      "Clover",
      "Lilac",
      "Lavender",
      "Posey",
    ];

    // 20. non_critical_items
    document.non_critical_items = [
      "13.8.1.1",
      "15.8.1.3",
      "19.5.3.2",
      "2.8.3.2",
      "6.2.6.3",
      "56.1.245.2",
      "6.23.5.7",
      "7.3.6.3",
      "6.2.2.1",
    ];

    // 21. number of critical items random between 0 and 45
    document.number_of_critical_items = Math.floor(Math.random() * 46);

    // 22. critical_items
    document.critical_items = [
      "13.8.1.1",
      "15.8.1.3",
      "19.5.3.2",
      "2.8.3.2",
      "6.2.6.3",
      "56.1.245.2",
      "6.23.5.7",
      "7.3.6.3",
      "6.2.2.1",
    ];

    // 23. number of non-critical items random between 0 and 45
    document.number_of_non_critical_items = Math.floor(Math.random() * 46);

    // 24. checklists
    document.checklists = {
      contents: [
        {
          checklist: "CF007M",
          detected_rules: 6,
          applicable_rules: 30,
        },
        {
          checklist: "CF009M",
          detected_rules: 30,
          applicable_rules: 45,
        },
      ],
      sort_helper: "CF007M_06_30_CF009M_30_45",
    };

    return document;
  };

  // insert documents
  const db = await DB.getDBConnection();
  const batchSize = 1000;
  for (let i = 0; i < totalSize; i += batchSize) {
    const documents = [];
    for (let j = 0; j < batchSize; j++) {
      documents.push(generateOneDocument());
    }
    await DB.insertDocuments(db, "documents", documents);
  }
}

async function mockResponsibleTeam(numStock) {
  const generateOneResponsibleTeam = () => {
    const responsibleTeam = {};
    // 1. stock_code random in [10000, 13000]
    const stockCode = 10000 + Math.floor(Math.random() * 20000);
    responsibleTeam.stock_code = stockCode.toString();
    // 2. team random in ["team1", "team2", "team3", "team4", "team5"]
    const teams = ["team1", "team2", "team3", "team4", "team5"];
    const teamIndex = Math.floor(Math.random() * teams.length);
    responsibleTeam.team = teams[teamIndex];
    return responsibleTeam;
  };

  const db = await DB.getDBConnection();
  for (let i = 0; i < numStock; i++) {
    const responsibleTeam = generateOneResponsibleTeam();
    responsibleTeam.stock_code = (i + 10000).toString();
    await db.collection("teams").insertOne(responsibleTeam);
  }
}

async function mockChecklists(
  numDocuments,
  numRules,
  numHighlights,
  numBlocks
) {
  console.log(`mocking ${numDocuments} checklists`);
  // get rid of the text attribute in blocks
  for (let i = 0; i < exampleHighlight.blocks.length; i++) {
    delete exampleHighlight.blocks[i].text;
  }

  const generateOneChecklist = () => {
    // generate a rule list of numRules rules
    const ruleIDs = [];
    for (let i = 0; i < numRules; i++) {
      const ruleID = crypto.randomUUID();
      ruleIDs.push(ruleID);
    }
    // a highlight object
    const highlight = {
      rule_id: crypto.randomUUID(),
      is_cross_page: true,
      page_range: [1, 5],
      content: exampleHighlight.content,
      blocks: exampleHighlight.blocks,
    };

    const rules = [];
    for (let i = 0; i < ruleIDs.length; i++) {
      // rules.$.rule_id
      const rule = {
        rule_id: ruleIDs[i],
        highlights: [],
        is_disclosed: true,
      };
      // rule.$.highlights
      for (let j = 0; j < numHighlights; j++) {
        rule.highlights.push(highlight);
      }
      rules.push(rule);
      // rule.$.default_highlights
      rule.default_highlights = rule.highlights;
    }

    const checklist = {
      document_id: crypto.randomUUID(),
      rules: rules,
    };
    return checklist;
  };

  const db = await DB.getDBConnection();
  const batchSize = 10;

  for (let i = 0; i < numDocuments; i += batchSize) {
    const checklists = [];
    for (let j = 0; j < batchSize; j++) {
      checklists.push(generateOneChecklist());
    }
    await DB.insertDocuments(db, "checklists", checklists);
  }
}

function mockMatrixEvents(numDocuments, numMatrices, numEvents) {
  console.log(`mocking ${numDocuments} matrix events`);
  const generateOneMatrixEvent = () => {
    const matrixEvent = {};
    matrixEvent.document_id = crypto.randomUUID();
    matrixEvent.matrices = exampleMatrixEvent.matrices;
    for (const key in matrixEvent.matrices) {
        for (const key2 in matrixEvent.matrices[key]) {
            matrixEvent.matrices[key][key2].highlights = [];
            for (let i = 0; i < 10; i++) {
                matrixEvent.matrices[key][key2].highlights.push(exampleHighlight);
            }
        }
    }

    return matrixEvent;
  };
}

function mockEventValues(totalSize) {}

function mockEditHistory(totalSize) {}

function mockTaggingTypes(totalSize) {}

async function main() {
  const ratio = 0.0001;
  const numDocuments = Math.trunc(NUMBER_DOCUMENTS * ratio);

  // init collections
  //   await initDocuments();
  //   await initResponsibleTeam();
  // await initChecklists();
  await initMatrixEvents();

  // adding data into the existing collections
  // await mockDocuments(numDocuments);
  // await mockResponsibleTeam(3000);
  // await mockChecklists(numDocuments, 45, 3);
}

main().catch(console.error);
