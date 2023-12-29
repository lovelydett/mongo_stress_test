"use strict";

const calculations = [];

const numCalculations = 20;

function generateCalculations() {
  if (calculations.length > 0) {
    return;
  }
  for (let i = 0; i < numCalculations; i++) {
    calculations.push("calculation_" + i);
  }
}

generateCalculations();

module.exports = calculations;
