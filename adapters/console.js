'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description CLI (command-line interface) adapter.
 */
module.exports = {
    init,
    onEvent: (listener) => { _listener = listener; }
}

// imports
let readline = require('readline');

// private
let _rl, _listener;

function init(config_adapter, cb) {
    // https://nodejs.org/api/readline.html
    _rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    _rl.setPrompt(config_adapter.prompt || '> ');

    _rl.on('line', function (text) {
        text = text || '';

        _listener({ from: config_adapter.from, text }, function(er, oo) {
            if (er) { // close
                console.log('bye');
                _rl.close();
            } else {
                console.log(oo.text);
                _rl.prompt();
            }
        });
    });

    let delay = config_adapter.delay || 1000;
    var timer = setTimeout(() => {
        _rl.prompt();
        clearTimeout(timer);
    }, delay);

    cb();
}
