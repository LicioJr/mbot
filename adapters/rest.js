'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description REST service adapter.
 */
module.exports = {
    init,
    onEvent: (listener) => { _listener = listener; }
}

// test [curl -is "http://localhost:8080/mbot?from=me&text=%23echo"]

// imports
let log = require('../lib').logger(),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring');

// private
let _server, _listener;

function init(config_adapter, cb) {
    let port = config_adapter.port || process.env.port;
    _server = http.createServer(function(req, res) {
        let part = url.parse(req.url);
        if (part.pathname == config_adapter.get) {
            const q = querystring.parse(part.query);
            const request = {
                from: q.from,
                text: q.text
            }

            _listener(request, function(er, oo) {
                res.setHeader('Content-Type', 'application/json');
                if (er) { // close
                    res.statusCode = 410; // Gone
                    res.end('bye');
                    req.connection.destroy();
                } else {
                    res.statusCode = 200;
                    res.end(JSON.stringify({text: oo.text}));
                }
            });
        } else {
            res.statusCode = 404;
            res.end();
        }
    }).on('listening', function() {
        log.info(`HTTP server listening to ${_server.address().address}:${port}${config_adapter.get}`);
        cb();
    }).on('error', function(er) {
        er = `HTTP server error: ${er}`;
        log.error(er);
        cb(er);
    }).listen(port);
}
