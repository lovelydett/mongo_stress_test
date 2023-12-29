"use strict";

const config = require("../config.json");

const rule = [];

function generateRules() {
    if (rule.length > 0) {
        return;
    }
    for (let i = 0; i < config.mock.checklists.numRulesPerDocument; i++) {
        rule.push("rule_" + i);
    }
}

generateRules();

module.exports = rule;