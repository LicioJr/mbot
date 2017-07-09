'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @description Generic logger.
 */
module.exports = logger;

/** @private */
let _winston, // dynamic ref
    configPath = require('../lib').configPath;

// this: name, configPath, config, _logger
// prototypes: info(), error(), debug(), dispose()

let _dummy = {
        info: (msg, cb) => { if (cb) cb() },
        error: (msg, cb) => { if (cb) cb() },
        debug: (msg, cb) => { if (cb) cb() }
    };

function native(type, msg, cb) {
    console.log(`${type} ${msg}`);
    if (cb) cb();
}

/**
 * Generic logger.<br>
 * If file 'config/name.{env}.json' exists, use 'logger' configuration key.<br>
 * Use mbot.logger() for integrated setup/dispose.
 * @class
 * @param {string=} name - Logger name (default 'index')
 * @example
 * var logger = mbot.load('util/logger');
 * var log = new logger('dir/name');
 */
function logger(name) {
    this.name = name || 'index';
    
    if (this.name.constructor !== String)
        throw new Error('logger name should be a string.');

    this.configPath = configPath(this.name); // full path

    if (!this.configPath) {
        //throw `required config for '${this.name}'`;
        this._logger = _dummy;
        return;
    }

    let configFile = require(this.configPath); // full path

    if (!configFile.logger) {
        //throw `required 'logger' key for '${this.name}'`;
        this._logger = _dummy;
        return;
    }

    // configuration found
    this.config = configFile.logger;

    if (this.config.type === 'winston') {
        if (!_winston) _winston = require('winston'); // once

        if (this._winston) return;

        this._winston = _winston.loggers.add(this.name, this.config.settings.loggers);
        //winston.loggers.get(this.name);

        if (!this.config.settings.loggers['console'])
            this._winston.remove(_winston.transports.Console);
        /*
        winston.add(winston.transports.Console, {
            timestamp: true,
            level: 'verbose',
            colorize: true
        });
        */
        
        this._winston.level = this.config.settings.level;

        //const tsFormat = () => (new Date()).toLocaleTimeString();
        //this._winston.transports.file.timestamp = 'tsFormat';
        this._logger = {
            info: this._winston.info,
            error: this._winston.error,
            debug: this._winston.debug
        }
    } else { // console
        this._logger = {
            info: function(msg, cb) { native('info', msg, cb); },
            error: function(msg, cb) { native('error', msg, cb); },
            debug: function(msg, cb) { native('debug', msg, cb); }
        }
    }
}

/**
 * Register an information message.
 * @instance
 * @param {string} msg - Message
 * @param {function=} cb - Callback
 */
logger.prototype.info = function(msg, cb) {
    this._logger.info(msg, cb);
}

/**
 * Register an error message.
 * @instance
 * @param {string} msg - Message
 * @param {function=} cb - Callback
 */
logger.prototype.error = function(msg, cb) {
    this._logger.error(msg, cb);
}

/**
 * Register a debug message.
 * @instance
 * @param {string} msg - Message
 * @param {function=} cb - Callback
 */
logger.prototype.debug = function(msg, cb) {
    this._logger.debug(msg, cb);
}

/**
 * Dispose the logger.
 * @instance
 * @param {function=} cb - Callback
 */
logger.prototype.dispose = function(cb) {
    let msg = `disposing [logger#${this.name}]...`;
    this._logger.info(msg, cb);
}
