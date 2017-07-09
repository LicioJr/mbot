'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Test automation adapter.
 */
module.exports = {
    init,
    onEvent: (listener) => { _listener = listener; },
    request // Test only
}

// private
let _cfg, _listener;

function init(config_adapter, cb) {
    _cfg = config_adapter;
    cb();
}

function request(text, cb) {
    _listener({ from: _cfg.from, text }, cb);
}
