"use strict"

const config = require("../config.json");

const matrices = [];

function generateMatrices() {
    if (matrices.length > 0) {
        return;
    }
    for (let i = 0; i < config.mock.matrix_events.numMatrixPerDocument; i++) {
        matrices.push("matrix_" + i);
    }
}

generateMatrices();

module.exports = matrices;