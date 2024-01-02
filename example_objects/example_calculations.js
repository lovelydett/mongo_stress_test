"use strict";

const calculations = [];

const config = require("../config.json");

function generateCalculations() {
  if (calculations.length > 0) {
    return;
  }
  for (let i = 0; i < config.mock.event_values.numCalculationsPerEvent; i++) {
    calculations.push("calculation_" + i);
  }
}

generateCalculations();

module.exports = calculations;
