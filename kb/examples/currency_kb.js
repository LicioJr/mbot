'use strict';
let mbot = require('../../lib'),
    spreadsheet = mbot.load('util/spreadsheet');

// private
let _data;

function init(cb) {
    _data = spreadsheet.readOne({
        // source: https://www.currency-iso.org/dam/downloads/lists/list_one.xls
        filename: mbot.path('kb/examples/resources/currency.xls'), 
        sheetname: 'Active'
    });
    return cb();
}

function codeToEntities(pCode) {
    return _data.filter(e => e['Alphabetic Code'] == pCode);
}

module.exports = {
    init,
    codeToEntities
}