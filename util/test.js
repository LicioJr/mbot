'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Test automation helper.
 */
module.exports = {
    requestTest
}

// imports
let mbot = require('../lib'),
    cfg = mbot.config(),
    assert = require('assert');

// private
let _adapter;

before((done) => {
    // this.timeout(0);
    mbot.init(null, (dic) => {
        for (let name in dic) {
            let er = dic[name].$initError;
            assert.strictEqual(er, undefined, er);
        }
        _adapter = mbot.load('adapters/test');
        done();
    });
});

after((done) => {
    if (_adapter) {
        let quitCommand = cfg.brain.admin.command.quit;
        _adapter.request(quitCommand, done);
    } else {
        done();
    }
});

/**
 * Request helper.
 * @static
 * @param {string} name - Test name
 * @param {Object[]} tests - Test list
 * @param {string} tests.request - Request text
 * @param {string} tests.expected - Expected reply text
 */
function requestTest(name, tests) {
    describe(name, function() {
        tests.forEach(e => {
            it(e.request, function(done) {
                _adapter.request(e.request, function(er, oo) {
                    assert(er == null, er);
                    if (e.expected instanceof Function)
                        e.expected(oo.text);
                    else
                        assert.strictEqual(oo.text, e.expected, oo.text);
                    done();
                });
            });
        });
    }); //.timeout(10000);
}
