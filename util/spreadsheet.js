'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Spreadsheet utilities.
 */
module.exports = {
    readOne,
    readAll
}

// imports
let xlsx = require('ts-xlsx');

/**
 * Read one sheet (sync).
 * @static
 * @param {Object} ii - Input Information
 * @param {string} ii.filename - Full path filename
 * @param {string=} ii.sheetname - Sheet name (default first sheet)
 * @return {Object[]} Rows array with column dictionary.
 */
function readOne(ii) {
    let workbook = xlsx.readFile(ii.filename);
    
    let sheetName = ii.sheetname || workbook.SheetNames[0];

    // raw: preserve number
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true });
}

/**
 * Read all sheets (sync).
 * @static
 * @param {Object} ii - Input Information
 * @param {string} ii.filename - Full path filename
 * @return {Object}
 * Sheet dictionary to rows array with column dictionary.
 */
function readAll(ii) {
    let workbook = xlsx.readFile(ii.filename);
    let sheets = {};
    workbook.SheetNames.forEach(e => {
        sheets[e] = xlsx.utils.sheet_to_json(workbook.Sheets[e], { raw: true });
    });
    return sheets;
}
