'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @description Universal database abstraction (use Sails Waterline).
 */
module.exports = db;

// imports (dynamic require adapter libs, use '_' prefix on adapterValue to ignore)
let Waterline = require('waterline');

/*
 * this._cfg: internal configuration
 * this._orm: internal Waterline reference
 * this.model: public model dictionary
 * 
 */

/**
 * Universal database abstraction (use Sails Waterline).<br>
 * Interface: {@link https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md}<br>
 * Usage: {@link http://sailsjs.com/documentation/concepts/models-and-orm}<br>
 * Available/Custom adapters: {@link http://sailsjs.com/documentation/concepts/extending-sails/adapters}
 * @class
 * @param {Object} cfg - Configuration
 * @param {Object} cfg.adapters - Adapters alias/name dictionary
 * @param {Object} cfg.connections - Connections alias/configuration dictionary
 */
function db(cfg) {
    if (!cfg) {
        let e = new Error('db.ctor(): empty configuration.');
        throw e;
    }

    // require db adapters
    for (let c in cfg.adapters) {
        // switched off?
        if (!cfg.adapters[c].startsWith('_')) {
            let lib = cfg.adapters[c];
            cfg.adapters[c] = require(lib);
        }
    }
    
    this._cfg = cfg;
}

/**
 * Open database connection.<br>
 * Model definition:
 * {@link https://github.com/balderdashy/waterline-docs/blob/master/models/configuration.md}
 * 
 * @param {Object} model - Model definition.
 * @param {function} cb - Callback
 */
db.prototype.open = function(model, cb) {
    // required Input Information
    if (!model) return cb('db.open(): empty model.');

    this._orm = new Waterline();

    // load model definitions
    for (let m in model) {
        let e = Waterline.Collection.extend(model[m]);
        this._orm.loadCollection(e);
    }

    let that = this;
    this._orm.initialize(this._cfg, function(er, rawModel) {
        if (er) return cb(er);
        //this.model = rawModel.collections;
        
        that.model = {};
        for (let c in rawModel.collections)
            that.model[c] = rawModel.collections[c];
        
        cb();
    });
};

/**
 * Dispose/Close database connection.
 * @param {function} cb - Callback
 */
db.prototype.dispose = function(cb) {
    this._orm.teardown(cb);
}
