'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description HTTP utilities.
 */
module.exports = {
    get
}

// imports
let mbot = require('../lib'),
    http = require('http'),
    https = require('https'),
    readFile = require('fs').readFile;


// private
function getGeneric(lib, ii, cb) {
    lib.get(ii.url, (res) => {
        // encodings: https://github.com/nodejs/node/blob/master/lib/buffer.js
        ii.encoding = ii.encoding || 'utf8'; // default
        res.setEncoding(ii.encoding);

        if (res.statusCode !== 200)
            return cb(`util/http: status ${res.statusCode}.`);

        var raw = '';
        res.on('data', (chunk) => {
            raw += chunk;
        });
        res.on('end', () => {
            cb(null, raw);
        });
    }).on('error', cb);
}

/**
 * Get HTTP/HTTPS data.<br>
 * Remark: use 'file://' for local test automation.
 * @static
 * @param {Object} ii - Input Information
 * @param {string} ii.url - URL ('http://', 'https://' or 'file://')
 * @param {string} ii.encoding - Text encoding (default 'utf8')
 * @param {function} cb - Callback
 * @param {Error} cb.er
 * @param {string} cb.data
 * @example
 * var http = mbot.load('util/http');
 * http.get({
 *     url: 'https://github.com/search?q=chat'
 * }, function(er, data) {
 *     if (er)
 *         console.log('error: ' + er);
 *     else
 *         console.log('data: ' + data);
 * });
 */
function get(ii, cb) {
    if (!ii.url)
        return cb('util/http: url required.');

    if (ii.url.startsWith('http://'))
        return getGeneric(http, ii, cb);

    if (ii.url.startsWith('https://'))
        return getGeneric(https, ii, cb);

    if (ii.url.startsWith('file://')) {
        let filename = mbot.path(ii.url.substr(7));
        ii.encoding = ii.encoding || 'utf8';
        return readFile(filename, ii.encoding, cb);
    }

    cb('util/http: url should start with "http://", "https://" or "file://".');
}
