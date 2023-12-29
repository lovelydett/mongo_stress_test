/**
 * @fileoverview the generator of this
 */

"use strict";

const config = require("../config.json");

/****** Begins the logic of this file ******/

const dataGenerator = {};
module.exports = dataGenerator;

const generateOneDocument = require("./documents.js");
const generateOneChecklist = require("./checklists.js");

