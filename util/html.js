'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description HTML parser/scraper utilities.
 */
module.exports = {
    extract
}

// imports
let Xray = require('x-ray'),
    mbot = require('../lib'),
    readFile = require('fs').readFile;

// private
let xray = new Xray();

/**
 * Extract HTML information from a URL (http/https/file).
 * @static
 * @param {Object} ii - Input Information
 * @param {string} ii.page - URL ('http://', 'https://' or 'file://')
 * @param {string|string[]} ii.selector - CSS selector
 * @param {string=} ii.encoding - HTML encoding (default 'utf8')
 * @param {string=} ii.paginate - CSS selector for pagination
 * @param {string=} ii.result - Result object CSS selectors
 * @param {function} cb - Callback
 * @param {Error} cb.er - Error
 * @param {string|string[]} cb.data - Output data
 * @example
 * var html = mbot.load('util/html');
 * html.extract({
 *     page: 'https://news.google.com/news/',
 *     selector: ['h2 > a > .titletext']
 * }, function(er, data) {
 *     if (er)
 *         console.log('error: ' + er);
 *     else
 *         console.log('data: ' + data.join('\n'));
 * });
 */
function extract(ii, cb) {
    if (ii.page.startsWith('file://')) {
        let filename = mbot.path(ii.page.substr(7));
        ii.encoding = ii.encoding || 'utf8';
        return readFile(filename, ii.encoding, (er, da) => {
            if (er) return cb(er);
            ii.page = da;
            return extract(ii, cb);
        });
    }
    let x = xray(ii.page, ii.selector, ii.result);
    if (ii.paginate) x.paginate(ii.paginate);
    return x(cb);
}
